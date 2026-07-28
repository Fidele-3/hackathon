import type { Me } from "./types";

export function isNationalAdmin(user: Me | null): boolean {
  return user?.user_level === "national_admin";
}

export function isDistrictOfficer(user: Me | null): boolean {
  return user?.user_level === "district_officer";
}

export function isSectorOfficer(user: Me | null): boolean {
  return user?.user_level === "sector_officer";
}

export function isCellOfficer(user: Me | null): boolean {
  return user?.user_level === "cell_officer";
}

export function isOfficer(user: Me | null): boolean {
  return (
    isNationalAdmin(user) || isDistrictOfficer(user) || isSectorOfficer(user) || isCellOfficer(user)
  );
}

/** Whether this officer's own specialization matches a crop/livestock category
 * (national admins have no specialization but can manage both). */
export function canManageCategory(user: Me | null, category: "crop" | "livestock"): boolean {
  const profile = user?.officer_profile;
  if (!profile) return false;
  if (profile.level === "national") return true;
  const expected = category === "crop" ? "agronomist" : "veterinary";
  return profile.specialization === expected;
}

export function levelLabel(user: Me | null): string {
  switch (user?.officer_profile?.level) {
    case "national":
      return "National Admin";
    case "district":
      return "District Officer";
    case "sector":
      return "Sector Officer";
    case "cell":
      return "Cell Officer";
    default:
      return "";
  }
}

export function specializationLabel(user: Me | null): string {
  const s = user?.officer_profile?.specialization;
  if (s === "agronomist") return "Agronomist";
  if (s === "veterinary") return "Veterinary";
  return "";
}
