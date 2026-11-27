const SAVED_TICKETS_KEY = "aerovista.savedTickets";
function isTicket(value) {
  return typeof value === "object" && value !== null && typeof value.reference === "string";
}
function parseSavedTickets(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTicket) : [];
  } catch {
    return [];
  }
}
function upsertTicket(list, ticket) {
  return [ticket, ...list.filter((t) => t.reference !== ticket.reference)];
}
function loadSavedTickets() {
  if (typeof window === "undefined") return [];
  return parseSavedTickets(window.localStorage.getItem(SAVED_TICKETS_KEY));
}
function writeSavedTickets(list) {
  window.localStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(list));
}
function saveTicket(ticket) {
  writeSavedTickets(upsertTicket(loadSavedTickets(), ticket));
}
function removeTicket(reference) {
  const next = loadSavedTickets().filter((t) => t.reference !== reference);
  writeSavedTickets(next);
  return next;
}
export {
  SAVED_TICKETS_KEY,
  loadSavedTickets,
  parseSavedTickets,
  removeTicket,
  saveTicket,
  upsertTicket,
  writeSavedTickets,
};
