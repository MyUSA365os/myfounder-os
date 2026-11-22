import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function PasswordRecovery({
  email,
  canSetPassword,
  loading,
  fromRecoveryLink,
  onReturn,
}: {
  email: string;
  canSetPassword: boolean;
  loading: boolean;
  fromRecoveryLink: boolean;
  onReturn: () => void;
}) {
  const [address, setAddress] = useState(email);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (canSetPassword && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (canSetPassword) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setConfirmation("");
        setStatus("Password updated. Continue to Founder HQ.");
      } else {
        const destination = new URL("/login", window.location.origin);
        destination.searchParams.set("recovery", "1");
        const { error } = await supabase.auth.resetPasswordForEmail(address.trim(), {
          redirectTo: destination.toString(),
        });
        if (error) throw error;
        setStatus("If the address is registered, a password reset link will arrive by email.");
      }
    } catch {
      setError(
        canSetPassword
          ? "The password could not be saved. Use a new password that meets the length requirement and try again."
          : "The reset request could not be sent. Wait a moment and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-5 text-center text-2xl font-semibold">Reset your Founder HQ password</h1>
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          {loading && fromRecoveryLink ? (
            <p role="status">Checking your recovery link…</p>
          ) : status ? (
            <p role="status" className="text-sm">
              {status}
            </p>
          ) : fromRecoveryLink && !canSetPassword ? (
            <p role="status" className="text-sm">
              This link is invalid or expired. Return to sign-in and request a new link.
            </p>
          ) : (
            <>
              {canSetPassword ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recovery-password">New password</Label>
                    <Input
                      id="recovery-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recovery-confirmation">Confirm new password</Label>
                    <Input
                      id="recovery-confirmation"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">Email</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {canSetPassword ? "Save new password" : "Email a reset link"}
              </Button>
            </>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onReturn}
            disabled={busy}
          >
            {canSetPassword && status ? "Continue to Founder HQ" : "Return to sign-in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
