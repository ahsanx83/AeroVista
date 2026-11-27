// Single axios instance for every API call. Interceptors attach the JWT and handle expired sessions.
import axios from "axios";

const TOKEN_KEY = "accessToken";
const BASE_URL = "http://aeroxvista.runasp.net"
export const api = axios.create({ baseURL: BASE_URL + "/api", timeout: 15000, headers: { "Content-Type": "application/json" } });

// Request interceptor: add "Authorization: Bearer <token>" when signed in.
api.interceptors.request.use((config) => {
  const token = typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// Response interceptor: unwrap data, and sign out locally on 401.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== "undefined") {
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event("aerovista-auth"));
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export async function login(input) {
  return await api.post("/auth/login", input);
}

export async function adminLogin(input) {
  return await api.post("/auth/admin/login", input);
}

export async function register(input) {
  return await api.post("/auth/register", input);
}
export async function fetchMe() {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  try {
    return (await api.get("/auth/profile")).user;
  } catch {
    return null;
  }
}
export async function logout() {

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");

}

// Flights
export async function searchFlights({ originCode, destinationCode, departureDate, passengers }) {
  const data = await api.post("/flights/search", { from: originCode, to: destinationCode, departureDate, passengers, cabinClass: "Economy" });
  return data;
}

// Bookings
export async function createBooking(id) {
  return await api.post('/bookings/' + id + '/confirm');
}

export async function cancelBooking(id) {
  return await api.post('/bookings/' + id + '/cancel');
}

export async function holdBooking(payload) {
  return await api.post('/bookings/hold', payload);
}

export async function myBooking() {
  return await api.get('/bookings/my');
}

// Profile
export async function fetchProfile() {
  return (await api.get("/profile")).profile;
}
export async function updateProfile(profile) {
  return (await api.put("/profile", profile)).profile;
}

export function apiErrorMessage(error) {
  if (axios.isAxiosError(error)) return error.response?.data?.error ?? "Network error";
  return "Something went wrong";
}
