"use client";

import { useActionState } from "react";
import { Lock, Mail } from "lucide-react";
import { loginAction, type ActionResult } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = { success: true };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 shadow-2xl">
      <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
        Log Worklogs
      </h1>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login"
              name="login"
              type="text"
              placeholder="you@team.local"
              className="pl-10"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {!state.success && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full uppercase tracking-wide" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </div>
  );
}
