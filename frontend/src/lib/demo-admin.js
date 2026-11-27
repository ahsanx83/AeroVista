const KEY = "aerovista.demoAdmin";
function loadDemoAdmin() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(KEY);
}
function saveDemoAdmin(email) {
  window.localStorage.setItem(KEY, email);
}
function signOutDemoAdmin() {
  window.localStorage.removeItem(KEY);
}
export { loadDemoAdmin, saveDemoAdmin, signOutDemoAdmin };
