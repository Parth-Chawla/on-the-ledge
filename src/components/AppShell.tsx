"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/budget", label: "Budget Planning" },
  { href: "/add-expense", label: "Add Expense" },
  { href: "/transactions", label: "Transactions" },
];

export function AppShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 md:px-8">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-primary">
            On The Ledge
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-3 py-1.5 ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface-low"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted">{name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded border border-line px-3 py-1.5 text-primary hover:bg-surface-low"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
        {children}
      </main>
      <footer className="border-t border-line/60 bg-card px-4 py-4 text-xs text-muted md:px-8">
        On-the-Ledge • University DBMS Project • Local database only
      </footer>
    </div>
  );
}
