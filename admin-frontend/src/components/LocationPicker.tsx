"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface LocOption {
  id: number;
  name: string;
}

/** Cascading province -> district -> sector -> cell picker. Calls
 * onChange with the id of whichever level `stopAt` names, once selected. */
export function LocationPicker({
  stopAt,
  onChange,
  required = true,
}: {
  stopAt: "district" | "sector" | "cell";
  onChange: (id: number | null) => void;
  required?: boolean;
}) {
  const [provinces, setProvinces] = useState<LocOption[]>([]);
  const [districts, setDistricts] = useState<LocOption[]>([]);
  const [sectors, setSectors] = useState<LocOption[]>([]);
  const [cells, setCells] = useState<LocOption[]>([]);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [cell, setCell] = useState("");

  useEffect(() => {
    api.get<LocOption[]>("/auth/locations/provinces/").then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    setDistrict("");
    setDistricts([]);
    setSector("");
    setSectors([]);
    setCell("");
    setCells([]);
    onChange(null);
    if (!province) return;
    api
      .get<LocOption[]>(`/auth/locations/districts/?province=${province}`)
      .then(setDistricts)
      .catch(() => setDistricts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  useEffect(() => {
    setSector("");
    setSectors([]);
    setCell("");
    setCells([]);
    if (stopAt === "district") onChange(district ? Number(district) : null);
    else onChange(null);
    if (!district || stopAt === "district") return;
    api
      .get<LocOption[]>(`/auth/locations/sectors/?district=${district}`)
      .then(setSectors)
      .catch(() => setSectors([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  useEffect(() => {
    setCell("");
    setCells([]);
    if (stopAt === "sector") onChange(sector ? Number(sector) : null);
    else if (stopAt === "cell") onChange(null);
    if (!sector || stopAt !== "cell") return;
    api
      .get<LocOption[]>(`/auth/locations/cells/?sector=${sector}`)
      .then(setCells)
      .catch(() => setCells([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector]);

  useEffect(() => {
    if (stopAt === "cell") onChange(cell ? Number(cell) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell]);

  const selectClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Province</label>
        <select required={required} value={province} onChange={(e) => setProvince(e.target.value)} className={selectClass}>
          <option value="">Select province</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">District</label>
        <select
          required={required}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          disabled={!province}
          className={selectClass}
        >
          <option value="">Select district</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {(stopAt === "sector" || stopAt === "cell") && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Sector</label>
          <select
            required={required}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            disabled={!district}
            className={selectClass}
          >
            <option value="">Select sector</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {stopAt === "cell" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Cell</label>
          <select
            required={required}
            value={cell}
            onChange={(e) => setCell(e.target.value)}
            disabled={!sector}
            className={selectClass}
          >
            <option value="">Select cell</option>
            {cells.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
