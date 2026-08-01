import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, User } from "lucide-react";
import { GLogo } from "@/components/gdigital/GLogo";
import { CosmosBg } from "@/components/gdigital/CosmosBg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход — G-Digital" },
      { name: "description", content: "Вход в G-Digital — умное управление личными финансами." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pressed, setPressed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPressed(true);
    setTimeout(() => navigate({ to: "/accounts" }), 320);
  };

  return (
    <main className="gd-cosmos relative min-h-screen overflow-hidden font-sans text-white">
      <CosmosBg />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[430px] flex-col items-center px-7 pt-14 pb-6">
        <div className="gd-fade-in flex flex-col items-center">
          <GLogo size={112} />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight [text-shadow:0_0_18px_rgba(139,92,246,0.6)]">G-Digital</h1>
          <p className="mt-1 text-xs tracking-[0.28em] text-white/60">SMART FINANCIAL MANAGEMENT</p>
        </div>

        <form onSubmit={submit} className="mt-10 flex w-full flex-col gap-4 gd-fade-in" style={{ animationDelay: "160ms" }}>
          <label className="neu-inset flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <User size={18} className="text-violet-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
          </label>
          <label className="neu-inset flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Lock size={18} className="text-violet-300" />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
          </label>

          <button
            type="submit"
            className={`gd-press mt-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 py-3.5 text-sm font-semibold tracking-wide neon-violet transition ${pressed ? "scale-[0.97] brightness-110" : ""}`}
          >
            Login
          </button>
        </form>

        <div className="mt-auto pt-10 text-center text-[11px] text-white/50">
          <p className="tracking-[0.18em]">Designed &amp; Developed by GURBANOV</p>
          <p className="mt-1 text-white/40">Version 1.0</p>
        </div>
      </div>
    </main>
  );
}