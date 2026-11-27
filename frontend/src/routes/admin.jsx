import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { apiErrorMessage, adminLogin } from "@/lib/api-client";
import { ArrowLeft, CircleAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/booking-validation";
import { ToastContainer, toast } from "react-toastify";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | AeroVista" },
      {
        name: "description",
        content: "Preview the separate AeroVista administrator sign-in screen.",
      },
      { property: "og:title", content: "Admin Sign In | AeroVista" },
      {
        property: "og:description",
        content: "Preview the separate AeroVista administrator sign-in screen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSignInPage,
});
function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [issues, setIssues] = useState([]);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      setIssues(result.error.issues);
      return;
    }
    setIssues([]);
    try {
      const data = await adminLogin({ email: result.data.email, password });

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
    } catch (error) {
      setNotice(apiErrorMessage(error));
      return;
    }
    setPassword("");
    void navigate({ to: "/admin-dashboard" });
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
        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.85fr)] lg:items-center lg:gap-16 lg:py-20">
          <section aria-labelledby="admin-title" className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck aria-hidden="true" className="size-4" /> Restricted area
            </p>
            <h1 id="admin-title" className="font-display text-4xl leading-tight sm:text-5xl">
              AeroVista
              <br />
              administrator access.
            </h1>
            {/* <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Administrator tools require server-checked access. This preview does not authenticate
              accounts or grant privileges.
            </p> */}
            {/* <div className="mt-7 flex items-start gap-3 border-l-2 border-coral pl-4">
              <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-accent-foreground"
              />
              <p className="text-sm leading-6 text-muted-foreground">
                Demo admin: admin@aerovista.demo / Admin@12345. Only this account receives the admin
                role in its token.
              </p> 
            </div> */}
          </section>

          <section
            aria-label="Administrator sign-in form"
            className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7"
          >
            <p className="text-xs font-semibold text-primary">ADMINISTRATOR</p>
            <h2 className="mt-1 font-display text-2xl">Sign in to admin</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your administrator account credentials.
            </p>
            <form className="mt-6 grid gap-4" noValidate onSubmit={handleSubmit}>
              <label className="block space-y-2" htmlFor="admin-email">
                <span className="text-sm font-semibold">Email address</span>
                <Input
                  aria-describedby={fieldIssue(issues, "email") ? "admin-email-error" : void 0}
                  aria-invalid={Boolean(fieldIssue(issues, "email"))}
                  autoComplete="username"
                  className="h-11 bg-background"
                  id="admin-email"
                  maxLength={254}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                  type="email"
                  value={email}
                />
                {fieldIssue(issues, "email") && (
                  <span className="block text-xs text-destructive" id="admin-email-error">
                    {fieldIssue(issues, "email")}
                  </span>
                )}
              </label>
              <label className="block space-y-2" htmlFor="admin-password">
                <span className="text-sm font-semibold">Password</span>
                <Input
                  aria-describedby={
                    fieldIssue(issues, "password") ? "admin-password-error" : void 0
                  }
                  aria-invalid={Boolean(fieldIssue(issues, "password"))}
                  autoComplete="current-password"
                  className="h-11 bg-background"
                  id="admin-password"
                  maxLength={128}
                  minLength={8}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  required
                  type="password"
                  value={password}
                />
                {fieldIssue(issues, "password") && (
                  <span className="block text-xs text-destructive" id="admin-password-error">
                    {fieldIssue(issues, "password")}
                  </span>
                )}
              </label>
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
                <ShieldCheck aria-hidden="true" /> Sign in to admin
              </Button>
            </form>
            <Button asChild className="mt-5 w-full" variant="ghost">
              <Link to="/sign-in">
                <ArrowLeft aria-hidden="true" /> Customer sign in
              </Link>
            </Button>
          </section>
        </main>
        <BookingFooter />
      </div>
    </>
  );
}
function fieldIssue(issues, field) {
  return issues.find((issue) => issue.path[0] === field)?.message;
}
