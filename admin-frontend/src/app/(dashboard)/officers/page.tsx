"use client";

import { FormEvent, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { api, ApiError } from "@/lib/api";
import { useList } from "@/lib/hooks";
import { Button, Card, DataTable, EmptyState, ErrorBanner, PageHeader, Spinner } from "@/components/ui";
import { LocationPicker } from "@/components/LocationPicker";
import type { Me, OfficerLevel, OfficerRoster, Specialization } from "@/lib/types";

interface LevelConfig {
  title: string;
  description: string;
  listPath: string;
  createPath: string;
  jurisdictionField: "managed_district" | "managed_sector" | "managed_cell";
  jurisdictionLabel: string;
  pickerStopAt: "district" | "sector" | "cell";
  rosterLevel: OfficerLevel;
}

const CONFIG_BY_LEVEL: Record<string, LevelConfig> = {
  national_admin: {
    title: "District Officers",
    description: "Create and view district-level officer accounts.",
    listPath: "/auth/officers/district/list/",
    createPath: "/auth/officers/district/",
    jurisdictionField: "managed_district",
    jurisdictionLabel: "Managed district",
    pickerStopAt: "district",
    rosterLevel: "district",
  },
  district_officer: {
    title: "Sector Officers",
    description: "Create and view sector-level officer accounts in your district.",
    listPath: "/auth/officers/sector/list/",
    createPath: "/auth/officers/sector/",
    jurisdictionField: "managed_sector",
    jurisdictionLabel: "Managed sector",
    pickerStopAt: "sector",
    rosterLevel: "sector",
  },
  sector_officer: {
    title: "Cell Officers",
    description: "Create and view cell-level officer accounts in your sector.",
    listPath: "/auth/officers/cell/list/",
    createPath: "/auth/officers/cell/",
    jurisdictionField: "managed_cell",
    jurisdictionLabel: "Managed cell",
    pickerStopAt: "cell",
    rosterLevel: "cell",
  },
};

interface CreateResponse {
  user: Me;
  temporary_password: string;
}

export default function OfficersPage() {
  const user = useAuthStore((s) => s.user);
  const config = user ? CONFIG_BY_LEVEL[user.user_level] : undefined;

  const { items, loading, error, reload } = useList<OfficerRoster>(config?.listPath ?? null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<CreateResponse | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [jurisdictionId, setJurisdictionId] = useState<number | null>(null);
  const [specialization, setSpecialization] = useState<Specialization>("agronomist");

  if (!config) {
    return <EmptyState message="Cell officers do not manage other officer accounts." />;
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!jurisdictionId) {
      setFormError(`Select the ${config.jurisdictionLabel.toLowerCase()} this officer will manage.`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        phone_number: phoneNumber,
        national_id: nationalId,
        full_name: fullName,
        email: email || undefined,
        work_email: workEmail || undefined,
        specialization,
        [config.jurisdictionField]: jurisdictionId,
      };
      const data = await api.post<CreateResponse>(config.createPath, payload);
      setCredentials(data);
      setShowForm(false);
      setPhoneNumber("");
      setNationalId("");
      setFullName("");
      setEmail("");
      setWorkEmail("");
      setJurisdictionId(null);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create officer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader title={config.title} description={config.description} />
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "New officer"}</Button>
      </div>

      {credentials && (
        <Card className="mb-6 border-emerald-300 p-4">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
            {credentials.user.full_name} created. Share this one-time temporary password securely — it will not be
            shown again.
          </p>
          <p className="mt-2 font-mono text-sm text-neutral-800 dark:text-neutral-200">
            {credentials.temporary_password}
          </p>
          <button onClick={() => setCredentials(null)} className="mt-2 text-xs text-neutral-500 underline">
            Dismiss
          </button>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6 p-6">
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <Field label="Full name" value={fullName} onChange={setFullName} required />
            <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} required placeholder="+250788000000" />
            <Field label="National ID" value={nationalId} onChange={setNationalId} required />
            <Field label="Personal email (optional)" value={email} onChange={setEmail} type="email" />
            <Field label="Work email (optional)" value={workEmail} onChange={setWorkEmail} type="email" />
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {config.jurisdictionLabel} this officer will manage
              </label>
              <LocationPicker stopAt={config.pickerStopAt} onChange={setJurisdictionId} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value as Specialization)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="agronomist">Agronomist (crop)</option>
                <option value="veterinary">Veterinary (livestock)</option>
              </select>
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create officer"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState message="No officers yet." />}
        {!loading && items.length > 0 && (
          <DataTable
            rows={items}
            keyFn={(row) => row.public_id}
            columns={[
              { header: "Name", render: (row) => row.full_name },
              { header: "Phone", render: (row) => row.phone_number },
              { header: "Specialization", render: (row) => row.specialization ?? "—" },
              {
                header: "Jurisdiction ID",
                render: (row) => row.managed_district ?? row.managed_sector ?? row.managed_cell ?? "—",
              },
              {
                header: "Status",
                render: (row) => (
                  <span className={row.is_active ? "text-emerald-600" : "text-neutral-400"}>
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
      />
    </div>
  );
}
