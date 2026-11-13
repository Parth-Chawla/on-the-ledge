"use client";

import { useActionState, useState } from "react";
import { login, type FormState } from "@/app/actions";

const initial: FormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      {state.error ? (
        <p className="rounded bg-bad-bg px-3 py-2 text-sm text-bad">{state.error}</p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="aarav.sharma@example.com"
          className="rounded border border-line px-3 py-2.5 font-normal outline-none focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <span className="relative">
          <input
            name="password"
            type={visible ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded border border-line px-3 py-2.5 pr-16 font-normal outline-none focus:border-primary"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-outline"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
