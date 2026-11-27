import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { loadDemoProfile, nameFromEmail, saveDemoProfile } from "@/lib/demo-account";
import { CircleAlert, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { airports } from "@/lib/airport-data";
import { apiErrorMessage, login, register } from "@/lib/api-client";
import { profileSignupSchema, signInSchema } from "@/lib/booking-validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Customer Sign In | AeroVista" },
      {
        name: "description",
        content: "Preview the AeroVista traveler account sign-in and profile form.",
      },
      { property: "og:title", content: "Customer Sign In | AeroVista" },
      {
        property: "og:description",
        content: "Preview the AeroVista traveler account sign-in and profile form.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});
function SignInPage() {
  const [mode, setMode] = useState("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredCabin, setPreferredCabin] = useState("economy");
  const [homeAirport, setHomeAirport] = useState("JFK");
  const [issues, setIssues] = useState([]);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    const result =
      mode === "create"
        ? profileSignupSchema.safeParse({ fullName, email, password, preferredCabin, homeAirport })
        : signInSchema.safeParse({ email, password });
    if (!result.success) {
      setIssues(result.error.issues);
      toast.error(result.error.issues[0]?.message ?? "Invalid form details.");
      return;
    }
    setIssues([]);
    let user;
    let createdProfile = null;
    try {
      let data;
      if (mode === "create") {
        data = await register({
          fullName,
          email: email.trim(),
          password,
          preferredCabin,
          homeAirport,
        });

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("expiresAt", data.expiresAt);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast.success("Profile created successfully");
        } else {
          if (data.error) {
            toast.error(data.error);
          } else {
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey) {
              const messages = data.errors[firstKey];
              toast.error(messages[0]);
            }
          }
        }
      } else {
        data = await login({ email: email.trim(), password, role: "customer" });

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("expiresAt", data.expiresAt);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast.success("Signed in successfully");
        } else {
          if (data.error) {
            toast.error(data.error);
          }
        }
      }
    } catch (error) {
      setNotice(apiErrorMessage(error));
      toast.error(error);
      return;
    }

    setPassword("");
    void navigate({ to: "/account" });
  }
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        text="xs"
      />
      <div className="min-h-screen bg-background text-foreground">
        <BookingHeader />
        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:py-14 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(26rem,1.15fr)] lg:items-center lg:gap-16 lg:py-20">
          <section aria-labelledby="customer-title" className="max-w-xl">
            <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary p-2 bg-green-100 rounded-lg w-[160px]">
              <UserRound aria-hidden="true" className="size-4" /> Traveler access
            </span>
            <h1 id="customer-title" className="font-display text-4xl leading-tight sm:text-5xl">
              Your journeys,
              <br />
              in one place.
            </h1>
            {/* <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Demo accounts are kept only in this browser until a database is connected. Your
              password is never stored.
            </p>
            <div className="mt-7 flex items-start gap-3 border-l-2 border-coral pl-4">
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-accent-foreground"
              />
              <p className="text-sm leading-6 text-muted-foreground">
                Demo: any valid email and 8+ character password signs you in as a customer with a
                secure token. After sign-in you can search and book flights.
              </p>
            </div> */}
          </section>

          <section
            aria-label="Customer account form"
            className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7"
          >
            <div
              className="mb-5 grid grid-cols-2 rounded-md border border-border bg-muted p-1"
              role="tablist"
              aria-label="Account action"
            >
              <Button
                aria-selected={mode === "sign-in"}
                className="w-full"
                onClick={() => {
                  setMode("sign-in");
                  setIssues([]);
                  setNotice("");
                }}
                role="tab"
                type="button"
                variant={mode === "sign-in" ? "secondary" : "ghost"}
              >
                Sign in
              </Button>
              <Button
                aria-selected={mode === "create"}
                className="w-full"
                onClick={() => {
                  setMode("create");
                  setIssues([]);
                  setNotice("");
                }}
                role="tab"
                type="button"
                variant={mode === "create" ? "secondary" : "ghost"}
              >
                Create profile
              </Button>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-primary">AEROVISTA ACCOUNT</p>
              <h2 className="mt-1 font-display text-2xl">
                {mode === "create" ? "Create a traveler profile" : "Welcome back"}
              </h2>
            </div>

            <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
              {mode === "create" && (
                <Field
                  id="full-name"
                  label="Full name"
                  value={fullName}
                  issue={fieldIssue(issues, "fullName")}
                  autoComplete="name"
                  maxLength={100}
                  onChange={setFullName}
                />
              )}
              <Field
                id="customer-email"
                label="Email address"
                value={email}
                issue={fieldIssue(issues, "email")}
                autoComplete="email"
                maxLength={254}
                type="email"
                onChange={setEmail}
              />
              <Field
                id="customer-password"
                label="Password"
                value={password}
                issue={fieldIssue(issues, "password")}
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                maxLength={128}
                type="password"
                onChange={setPassword}
              />
              {mode === "create" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2" htmlFor="preferred-cabin">
                    <span className="text-sm font-semibold">Preferred cabin</span>
                    <select
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                      id="preferred-cabin"
                      onChange={(event) => setPreferredCabin(event.currentTarget.value)}
                      value={preferredCabin}
                    >
                      <option value="economy">Economy</option>
                      <option value="premium">Premium economy</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                    </select>
                  </label>
                  <label className="block space-y-2" htmlFor="home-airport">
                    <span className="text-sm font-semibold">Home airport</span>
                    <select
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                      id="home-airport"
                      onChange={(event) => setHomeAirport(event.currentTarget.value)}
                      value={homeAirport}
                    >
                      {airports.map((airport) => (
                        <option key={airport.code} value={airport.code}>
                          {airport.city} · {airport.code}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {issues.length > 0 && (
                <p aria-live="polite" className="text-sm text-destructive" role="alert">
                  {issues[0]?.message ?? "Review the form details."}
                </p>
              )}
              {notice && (
                <p
                  aria-live="polite"
                  className="rounded-md border border-accent/40 bg-accent/10 p-3 text-sm leading-5 text-accent-foreground"
                  role="status"
                >
                  {notice}
                </p>
              )}
              <Button className="mt-1 h-11 w-full" type="submit">
                {mode === "create" ? "Create profile" : "Sign in"}
              </Button>
            </form>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Administrator?{" "}
              <Link className="font-semibold text-primary underline underline-offset-4" to="/admin">
                Use the separate admin sign-in
              </Link>
              .
            </p>
          </section>
        </main>
        <BookingFooter />
      </div>
    </>
  );
}
function Field({ id, label, value, issue, autoComplete, maxLength, type = "text", onChange }) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <Input
        aria-describedby={issue ? `${id}-error` : void 0}
        aria-invalid={Boolean(issue)}
        autoComplete={autoComplete}
        className="h-11 bg-background"
        id={id}
        maxLength={maxLength}
        minLength={type === "password" ? 8 : void 0}
        onChange={(event) => onChange(event.currentTarget.value)}
        required
        type={type}
        value={value}
      />
      {issue && (
        <span className="block text-xs text-destructive" id={`${id}-error`}>
          {issue}
        </span>
      )}
    </label>
  );
}
function fieldIssue(issues, field) {
  return issues.find((issue) => issue.path[0] === field)?.message;
}
