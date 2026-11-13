import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-surface px-4 py-16"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0, 92, 85, 0.04) 1px, transparent 1px), linear-gradient(rgba(0, 92, 85, 0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-surface-high bg-card p-8 shadow-md">
        <p className="text-center font-display text-2xl font-semibold tracking-tight text-primary">
          On The Ledge
        </p>
        <p className="mt-1 text-center text-sm text-muted">Plan your money with purpose.</p>
        <p className="mt-3 text-center text-xs text-outline">
          Local database authentication • course demo
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
