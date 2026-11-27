const KEY = "aerovista.demoProfile";
function nameFromEmail(email) {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Traveler";
}
function loadDemoProfile() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}
function saveDemoProfile(profile) {
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}
function signOutDemo() {
  window.localStorage.removeItem(KEY);
}
export { loadDemoProfile, nameFromEmail, saveDemoProfile, signOutDemo };
