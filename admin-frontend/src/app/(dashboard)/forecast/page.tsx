"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button, Card, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import { LocationPicker } from "@/components/LocationPicker";
import type { ForecastResult } from "@/lib/types";

interface CropOption {
  id: number;
  name: string;
  local_name: string;
}

export default function ForecastPage() {
  const user = useAuthStore((s) => s.user);
  const isNational = user?.user_level === "national_admin";

  const [crops, setCrops] = useState<CropOption[]>([]);
  const [cropId, setCropId] = useState("");
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [season, setSeason] = useState("");
  const [seasonYear, setSeasonYear] = useState("");
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<CropOption[]>("/production/catalog/crops/").then(setCrops).catch(() => setCrops([]));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isNational && !districtId) {
      setError("Select a district.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ crop: cropId });
      if (isNational && districtId) params.set("district", String(districtId));
      if (season) params.set("season", season);
      if (seasonYear) params.set("season_year", seasonYear);

      const path = isNational ? `/ai/forecast/national/?${params}` : `/ai/forecast/district/?${params}`;
      const data = await api.get<ForecastResult>(path);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate forecast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Crop Forecast"
        description="Generate an AI-assisted production forecast for a crop and season, grounded in real climate data and past same-season harvest history."
      />

      <Card className="mb-6 p-6">
        {error && <ErrorBanner message={error} />}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Crop</label>
            <select
              required
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Select crop</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.local_name ? `(${c.local_name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Season (optional)
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Current season</option>
              <option value="A">Season A</option>
              <option value="B">Season B</option>
              <option value="C">Season C</option>
            </select>
          </div>

          {isNational && (
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">District</label>
              <LocationPicker stopAt="district" onChange={setDistrictId} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Season year (optional)
            </label>
            <input
              type="number"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate forecast"}
            </Button>
          </div>
        </form>
      </Card>

      {loading && <Spinner />}
      {result && (
        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {result.crop} — {result.district} — Season {result.season} {result.season_year}
          </h2>
          <p className="whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">{result.forecast}</p>
        </Card>
      )}
    </div>
  );
}
