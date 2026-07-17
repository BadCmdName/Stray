import Link from "next/link";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#1a1a1e] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-10 w-10" />
          <span className="text-2xl font-black tracking-wider text-white uppercase">STRAY</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition">
          Back to Home
        </Link>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-8 py-16">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-8">Disclaimer & Educational Use</h1>
        <p className="text-zinc-500 text-xs mb-6">Last Updated: July 2026</p>

        <div className="flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed font-medium">
          <section className="bg-rose-950/20 border-2 border-rose-900 text-rose-300 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <strong>⚠️ IMPORTANT WARNING:</strong> Stray is a selfbot application client. Operating a custom presence daemon on a personal Discord user account is a breach of Discord&rsquo;s Developer Terms of Service and user guidelines. Use of this utility risks permanent account termination.
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">1. Educational Purpose</h2>
            <p>
              Stray is created and distributed as an educational experiment in WebSocket networking protocol compliance, device headers spoofing, and API payload modeling. The source code is intended for research, personal learning, and academic verification only.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">2. Liability Limitation</h2>
            <p>
              Under no circumstances shall the creators, maintainers, or website distributors of Stray (stray.bcnstudio.tech) be held liable for any damages, suspensions, restrictions, or data losses resulting from downloading, compiling, running, or altering this software.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">3. User Responsibility</h2>
            <p>
              You, the user, assume full responsibility for your actions. If you choose to connect the Stray daemon to an active user token, you accept all associated risks, including loss of account credentials and account bans.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#16161a] px-8 py-6 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Stray. Built for self-hosted noncommercial use.</p>
      </footer>
    </div>
  );
}
