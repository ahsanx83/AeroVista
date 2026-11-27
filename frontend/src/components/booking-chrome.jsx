import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, LogOut, PlaneTakeoff, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/api-client";
function BookingHeader() {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.role : null;
  const signedIn = Boolean(localStorage.getItem("accessToken"));
  const navigate = useNavigate();
  const isAdmin = user?.role === "Admin";
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[4.5rem] md:px-8">
        <Link to="/" aria-label="AeroVista home" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <PlaneTakeoff aria-hidden="true" className="size-[18px]" />
          </span>
          <span className="font-display text-xl text-foreground md:text-2xl">AeroVista</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {isAdmin ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/admin-dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/concurrency-test">Concurrency test</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/">Flights</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/account">My account</Link>
              </Button>
              {/* <Button asChild size="sm" variant="ghost">
                <Link to="/tickets">Saved tickets</Link>
              </Button> */}
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button
                  asChild
                  aria-label="Dashboard"
                  className="size-9 md:hidden"
                  size="icon"
                  variant="ghost"
                >
                  <Link to="/admin-dashboard">
                    <LayoutDashboard aria-hidden="true" />
                  </Link>
                </Button>
              )}
              {!isAdmin && (
                <Button
                  asChild
                  aria-label="Saved tickets"
                  className="size-9 md:hidden"
                  size="icon"
                  variant="ghost"
                >
                  <Link to="/tickets">
                    <Ticket aria-hidden="true" />
                  </Link>
                </Button>
              )}
              <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:inline">
                {user.email} · {user.role}
              </span>
              <Button
                aria-label="Sign out"
                className="h-9 px-3"
                onClick={() => {
                  logout();
                  void navigate({ to: isAdmin ? "/admin" : "/sign-in" });
                }}
                variant="outline"
              >
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                aria-label="Administrator sign in"
                className="size-9"
                size="icon"
                title="Administrator sign in"
                variant="ghost"
              >
                <Link to="/admin">
                  <ShieldCheck aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                aria-label="Customer sign in"
                className="h-9 px-3 sm:px-4"
                variant="outline"
              >
                <Link to="/sign-in">
                  <LogIn aria-hidden="true" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
function BookingFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>
          Airport reference:{" "}
          <a
            className="font-medium text-primary underline underline-offset-4"
            href="https://ourairports.com/data/"
            rel="noreferrer"
            target="_blank"
          >
            OurAirports public-domain data
          </a>
          .
        </p>
        {/* <p>Flight schedules and fares are examples, not live offers.</p> */}
      </div>
    </footer>
  );
}
export { BookingFooter, BookingHeader };
