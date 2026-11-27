import { z } from "zod";
const validDateInput = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
function createSearchSchema(today) {
  return z
    .object({
      originCode: z.string().trim().length(3, "Choose a departure airport."),
      destinationCode: z.string().trim().length(3, "Choose a destination airport."),
      departureDate: z.string().refine(validDateInput, "Choose a valid travel date."),
      passengers: z.coerce
        .number()
        .int("Choose a whole number of passengers.")
        .min(1, "At least 1 passenger is required.")
        .max(9, "A booking can include up to 9 passengers."),
    })
    .superRefine((value, context) => {
      if (value.originCode === value.destinationCode) {
        context.addIssue({
          code: "custom",
          path: ["destinationCode"],
          message: "Choose a different destination airport.",
        });
      }
      if (validDateInput(value.departureDate) && value.departureDate < today) {
        context.addIssue({
          code: "custom",
          path: ["departureDate"],
          message: "Travel date must be today or later.",
        });
      }
    });
}
const passengerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter the passenger's first name.")
    .max(70, "First name must be 70 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter the passenger's last name.")
    .max(70, "Last name must be 70 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
});
const profileSignupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
  preferredCabin: z.enum(["economy", "premium", "business", "first"]),
  homeAirport: z.string().length(3, "Choose a home airport."),
});
const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});
function getLocalDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function createDemoBookingReference(random = Math.random) {
  return Array.from({ length: 6 }, () => REF_CHARS[Math.floor(random() * REF_CHARS.length)]).join(
    "",
  );
}
const profileUpdateSchema = profileSignupSchema.omit({ password: true }).extend({
  phone: z
    .string()
    .trim()
    .regex(/^$|^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number."),
});
export {
  createDemoBookingReference,
  createSearchSchema,
  getLocalDateInputValue,
  passengerSchema,
  profileSignupSchema,
  profileUpdateSchema,
  signInSchema,
};
