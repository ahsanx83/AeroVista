import { Link } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
function RoleGate({ role, children }) {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const signedIn = Boolean(localStorage.getItem("accessToken"));

  if (user?.role === "Customer") return <>{children}</>;
  const admin = user?.role === "Admin";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BookingHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        {user === null && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            {admin ? (
              <ShieldCheck aria-hidden="true" className="mx-auto size-8 text-primary" />
            ) : (
              <LockKeyhole aria-hidden="true" className="mx-auto size-8 text-primary" />
            )}
            <h1 className="mt-3 font-display text-3xl">
              {admin ? "Admins only" : "Sign in to book"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {user
                ? `You are signed in as ${user.role}. This page needs a ${role} account.`
                : admin
                  ? "Sign in as an administrator to continue."
                  : "Sign in with a customer account to search and book flights."}
            </p>
            <Button asChild className="mt-5">
              <Link to={admin ? "/admin" : "/sign-in"}>
                {admin ? "Admin sign in" : "Customer Sign In"}
              </Link>
            </Button>
          </div>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
export { RoleGate };
