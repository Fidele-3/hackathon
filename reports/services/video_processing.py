import json
import logging
import os
import subprocess
from typing import Any, Dict, List, Tuple

import static_ffmpeg

logger = logging.getLogger(__name__)

_ffmpeg_paths_ready = False


def _ensure_ffmpeg_available():
    """Guarantees ffmpeg/ffprobe are resolvable on PATH regardless of what
    the host container actually provides -- a nixpacks.toml asking the
    build to install ffmpeg turned out not to be enough (this Railway
    deploy's /mise/... paths suggest it isn't even building via classic
    Nixpacks package installation, so that config was silently never
    applied), and every video-processing task failed instantly with
    FileNotFoundError: [Errno 2] No such file or directory: 'ffprobe' as a
    result. static_ffmpeg.add_paths() downloads a static ffmpeg+ffprobe
    build on first use (cached in this package's install directory
    afterward) and prepends it to PATH.

    Called lazily (right before the first actual subprocess call) rather
    than at module import time -- this module is imported by every process
    that touches houses.task.media_task, including the web server and
    management commands that never transcode anything, and none of those
    should pay for (or risk failing on) a network fetch they don't need.
    """
    global _ffmpeg_paths_ready
    if _ffmpeg_paths_ready:
        return
    try:
        static_ffmpeg.add_paths()
        _ffmpeg_paths_ready = True
    except Exception:
        logger.exception("static_ffmpeg.add_paths() failed -- ffmpeg/ffprobe may not be available.")


VARIANT_PRESETS = [
    {
        "name": "480p",
        "height": 480,
        "width": 854,
        "video_bitrate": "1200k",
        "maxrate": "1500k",
        "bufsize": "2400k",
        "audio_bitrate": "96k",
        "bandwidth": 1800000,
    },
    {
        "name": "720p",
        "height": 720,
        "width": 1280,
        "video_bitrate": "2800k",
        "maxrate": "3200k",
        "bufsize": "5600k",
        "audio_bitrate": "128k",
        "bandwidth": 3500000,
    },
    {
        "name": "1080p",
        "height": 1080,
        "width": 1920,
        "video_bitrate": "5000k",
        "maxrate": "6000k",
        "bufsize": "10000k",
        "audio_bitrate": "192k",
        "bandwidth": 6200000,
    },
]


def ffprobe_video_info(input_path: str) -> Dict[str, Any]:
    _ensure_ffmpeg_available()
    probe_cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        input_path,
    ]
    result = subprocess.run(probe_cmd, check=True, capture_output=True, text=True)
    payload = json.loads(result.stdout or "{}")

    video_stream = next((stream for stream in payload.get("streams", []) if stream.get("codec_type") == "video"), {})
    has_audio = any(stream.get("codec_type") == "audio" for stream in payload.get("streams", []))
    duration = float(payload.get("format", {}).get("duration", 0) or 0)

    return {
        "duration": duration,
        "width": int(video_stream.get("width") or 0),
        "height": int(video_stream.get("height") or 0),
        "has_audio": has_audio,
        "size": int(payload.get("format", {}).get("size") or 0),
    }


def _select_variants(source_width: int, source_height: int) -> List[Dict]:
    variants = []
    for preset in VARIANT_PRESETS:
        # Select variants based on source height only. Width restrictions
        # can incorrectly exclude valid variants when videos have narrow
        # aspect ratios (e.g. tall videos). Use height to decide which
        # target resolutions make sense for the source.
        if source_height >= preset["height"]:
            variants.append(preset)

    if not variants:
        variants = [VARIANT_PRESETS[0]]

    return variants


def _make_even(value: float) -> int:
    return max(2, int(round(value / 2)) * 2)


def _scaled_dimensions(source_width: int, source_height: int, preset: Dict) -> Tuple[int, int]:
    if not source_width or not source_height:
        return preset["width"], preset["height"]

    scale = min(preset["width"] / source_width, preset["height"] / source_height)
    return _make_even(source_width * scale), _make_even(source_height * scale)


def _run_hls_variant(
    input_path: str, output_dir: str, preset: Dict, has_audio: bool, trim_seconds: int | None = None
) -> str:
    playlist_filename = f"{preset['name']}.m3u8"
    segment_pattern = os.path.join(output_dir, f"{preset['name']}_%03d.ts")
    playlist_path = os.path.join(output_dir, playlist_filename)

    cmd = ["ffmpeg", "-y", "-i", input_path]
    # Client-consented "only use the first N seconds" (see
    # HouseMediaSerializer.trim_seconds) -- placed right after -i so every
    # HLS variant is cut identically, before any of the per-variant encode
    # flags below.
    if trim_seconds:
        cmd.extend(["-t", str(trim_seconds)])

    cmd.extend([
        "-map",
        "0:v:0",
        "-vf",
        (
            f"scale=w={preset['width']}:h={preset['height']}:"
            "force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-profile:v",
        "main",
        "-crf",
        "22",
        "-b:v",
        preset["video_bitrate"],
        "-maxrate",
        preset["maxrate"],
        "-bufsize",
        preset["bufsize"],
        "-fps_mode",
        "vfr",
    ])

    if has_audio:
        cmd.extend(
            [
                "-map",
                "0:a:0?",
                "-c:a",
                "aac",
                "-b:a",
                preset["audio_bitrate"],
                "-ac",
                "2",
                "-ar",
                "48000",
            ]
        )

    cmd.extend(
        [
            "-hls_time",
            "4",
            "-hls_playlist_type",
            "vod",
            "-hls_flags",
            "independent_segments",
            "-hls_segment_filename",
            segment_pattern,
            playlist_path,
        ]
    )
    subprocess.run(cmd, check=True)
    return playlist_filename


def _write_master_playlist(
    output_dir: str,
    variants: List[Dict],
    variant_playlist_names: Dict[str, str],
    has_audio: bool,
) -> str:
    master_name = "master.m3u8"
    master_path = os.path.join(output_dir, master_name)

    lines = ["#EXTM3U", "#EXT-X-VERSION:3"]
    for preset in variants:
        playlist_name = variant_playlist_names[preset["name"]]
        width = preset.get("output_width", preset["width"])
        height = preset.get("output_height", preset["height"])
        codecs = "avc1.4d001f,mp4a.40.2" if has_audio else "avc1.4d001f"
        lines.append(
            f"#EXT-X-STREAM-INF:BANDWIDTH={preset['bandwidth']},RESOLUTION={width}x{height},CODECS=\"{codecs}\""
        )
        lines.append(playlist_name)

    with open(master_path, "w", encoding="utf-8") as stream:
        stream.write("\n".join(lines) + "\n")

    return master_name


def _generate_thumbnail(input_path: str, output_dir: str) -> str:
    thumbnail_name = "thumbnail.jpg"
    thumbnail_path = os.path.join(output_dir, thumbnail_name)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            "00:00:00",
            "-i",
            input_path,
            "-frames:v",
            "1",
            "-q:v",
            "2",
            thumbnail_path,
        ],
        check=True,
    )
    return thumbnail_name


def _playlist_has_segments(playlist_path: str) -> bool:
    if not os.path.exists(playlist_path):
        return False

    with open(playlist_path, "r", encoding="utf-8") as stream:
        payload = stream.read()
    return ".ts" in payload


def transcode_to_adaptive_hls(input_path: str, output_dir: str, trim_seconds: int | None = None) -> Dict:
    os.makedirs(output_dir, exist_ok=True)

    info = ffprobe_video_info(input_path)
    # Only trim if the source is actually longer than the requested cut --
    # a shorter source just gets transcoded in full as usual.
    effective_trim_seconds = trim_seconds if trim_seconds and trim_seconds < info["duration"] else None

    variants = _select_variants(source_width=info["width"], source_height=info["height"])
    variants_with_dimensions = []
    for preset in variants:
        output_width, output_height = _scaled_dimensions(info["width"], info["height"], preset)
        variants_with_dimensions.append(
            {
                **preset,
                "output_width": output_width,
                "output_height": output_height,
            }
        )
    variants = variants_with_dimensions

    variant_playlist_names = {}
    has_audio = bool(info.get("has_audio"))
    for preset in variants:
        variant_playlist_names[preset["name"]] = _run_hls_variant(
            input_path,
            output_dir,
            preset,
            has_audio=has_audio,
            trim_seconds=effective_trim_seconds,
        )

    master_name = _write_master_playlist(output_dir, variants, variant_playlist_names, has_audio=has_audio)
    thumbnail_name = _generate_thumbnail(input_path, output_dir)

    for preset in variants:
        playlist_name = variant_playlist_names[preset["name"]]
        playlist_path = os.path.join(output_dir, playlist_name)
        if not _playlist_has_segments(playlist_path):
            raise RuntimeError(f"Variant playlist {playlist_name} has no transport stream segments")

    return {
        "master_playlist": master_name,
        "variant_playlists": variant_playlist_names,
        "thumbnail": thumbnail_name,
        # Reflects what was actually kept, not the original probed length,
        # when a trim was applied.
        "duration": effective_trim_seconds or info["duration"],
        "width": info["width"],
        "height": info["height"],
        "file_size": info["size"],
    }
