"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setResetMessage(null);

    try {
      setLoading(true);
      setStatusMessage("Invio credenziali…");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile verificare il tuo account manager.");
      }

      setStatusMessage(payload.message ?? "Accesso riuscito. Reindirizzamento in corso…");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error("[login] Error during sign-in", err);
      setError(err instanceof Error ? err.message : "Si è verificato un errore imprevisto.");
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetMessage(null);

    if (!email) {
      setError("Inserisci la tua email per reimpostare la password.");
      return;
    }

    try {
      setStatusMessage("Invio email di reset…");
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossibile inviare l'email di reset.");
      }

      setResetMessage(payload.message ?? "Ti abbiamo inviato un'email per reimpostare la password.");
      setStatusMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossibile inviare l'email di reset.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#3A7BD5]">Namely</p>
          <h1 className="text-2xl font-semibold text-gray-900">Area manager</h1>
          <p className="text-sm text-gray-600">Accedi per gestire la tua struttura.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#3A7BD5] focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-[#3A7BD5] focus:outline-none focus:ring-2 focus:ring-[#3A7BD5]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#3A7BD5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#356fc0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Accesso in corso…" : "Accedi"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-sm font-medium text-[#3A7BD5] hover:text-[#1B5CB8]"
          >
            Hai dimenticato la password?
          </button>
        </div>

        {statusMessage ? (
          <p className="mt-4 text-center text-xs font-medium text-[#1B5CB8]">{statusMessage}</p>
        ) : null}
        {error ? <p className="mt-3 text-center text-sm text-red-500">{error}</p> : null}
        {resetMessage ? (
          <p className="mt-3 text-center text-sm text-[#1B5CB8]">{resetMessage}</p>
        ) : null}
      </div>
    </div>
  );
};

export default LoginPage;

