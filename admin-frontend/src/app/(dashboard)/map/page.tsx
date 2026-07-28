"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useAuthStore } from "@/lib/auth-store";
import { api, ApiError } from "@/lib/api";
import { Button, Card, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import type { FarmerIssue, Insight, Paginated } from "@/lib/types";

type FarmerIssueGeo = FarmerIssue & { latitude: number | null; longitude: number | null; cell_name: string | null };

const CATEGORY_COLOR: Record<string, string> = { crop: "#059669", livestock: "#d97706" };
const STATUS_COLOR: Record<string, string> = {
  open: "#6b7280",
  assigned: "#2563eb",
  resolved: "#059669",
  rejected: "#dc2626",
};

function markerIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MapPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<FarmerIssueGeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<Paginated<FarmerIssueGeo> | FarmerIssueGeo[]>("/messaging/officer/issues/?page_size=500")
      .then((data) => setItems(Array.isArray(data) ? data : data.results))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load issues."))
      .finally(() => setLoading(false));
  }, []);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerGroupsRef = useRef<{ crop: L.LayerGroup; livestock: L.LayerGroup } | null>(null);

  const [layerVisible, setLayerVisible] = useState({ crop: true, livestock: true });
  const [colorMode, setColorMode] = useState<"category" | "status">("category");

  const [insight, setInsight] = useState<Insight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const canAnalyze = user?.user_level === "national_admin" || user?.user_level === "district_officer";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([-1.9403, 29.8739], 8); // Rwanda center
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    layerGroupsRef.current = { crop: L.layerGroup().addTo(map), livestock: L.layerGroup().addTo(map) };
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const groups = layerGroupsRef.current;
    if (!groups) return;
    groups.crop.clearLayers();
    groups.livestock.clearLayers();

    items
      .filter((issue) => issue.latitude != null && issue.longitude != null)
      .forEach((issue) => {
        const color = colorMode === "category" ? CATEGORY_COLOR[issue.category] : STATUS_COLOR[issue.status];
        const marker = L.marker([issue.latitude as number, issue.longitude as number], { icon: markerIcon(color) });
        marker.bindPopup(
          `<div style="min-width:180px">
            <strong>${issue.category === "crop" ? "Crop" : "Livestock"} issue</strong> · ${issue.status}<br/>
            <span style="font-size:12px;color:#666">${issue.cell_name ?? ""}</span>
            <p style="margin-top:6px;font-size:13px">${issue.description.slice(0, 140)}</p>
          </div>`
        );
        (issue.category === "crop" ? groups.crop : groups.livestock).addLayer(marker);
      });
  }, [items, colorMode]);

  useEffect(() => {
    const groups = layerGroupsRef.current;
    const map = mapRef.current;
    if (!groups || !map) return;
    if (layerVisible.crop) groups.crop.addTo(map);
    else map.removeLayer(groups.crop);
    if (layerVisible.livestock) groups.livestock.addTo(map);
    else map.removeLayer(groups.livestock);
  }, [layerVisible]);

  const analyze = () => {
    setAnalyzing(true);
    setAnalyzeError(null);
    const path = user?.user_level === "national_admin" ? "/ai/insights/national/" : "/ai/insights/district/";
    api
      .get<Insight>(path)
      .then(setInsight)
      .catch((err) => setAnalyzeError(err instanceof ApiError ? err.message : "Failed to analyze."))
      .finally(() => setAnalyzing(false));
  };

  return (
    <div>
      <PageHeader
        title="Issue Map"
        description="Every farmer-reported issue in your jurisdiction, plotted by cell location. Toggle layers, or ask the AI to analyze what's on the map."
      />

      {error && <ErrorBanner message={error} />}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={layerVisible.crop}
            onChange={(e) => setLayerVisible((v) => ({ ...v, crop: e.target.checked }))}
          />
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: CATEGORY_COLOR.crop }} /> Crop issues
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={layerVisible.livestock}
            onChange={(e) => setLayerVisible((v) => ({ ...v, livestock: e.target.checked }))}
          />
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: CATEGORY_COLOR.livestock }} /> Livestock issues
        </label>
        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value as "category" | "status")}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="category">Color by category</option>
          <option value="status">Color by status</option>
        </select>
        {loading && <Spinner />}
        {canAnalyze && (
          <Button onClick={analyze} disabled={analyzing} className="ml-auto">
            {analyzing ? "Analyzing…" : "Analyze with AI"}
          </Button>
        )}
      </div>

      <Card className="mb-6 h-[520px] overflow-hidden p-0">
        <div ref={containerRef} className="h-full w-full" />
      </Card>

      {analyzeError && <ErrorBanner message={analyzeError} />}
      {insight && (
        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">AI analysis</h2>
          <p className="whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{insight.content}</p>
        </Card>
      )}
    </div>
  );
}
