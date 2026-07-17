import Link from "next/link";

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-zinc-505 text-xs mb-6">Last Updated: July 2026</p>

        <div className="flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed font-medium">
          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">1. Principle of Zero Data Collection</h2>
            <p>
              Your privacy is paramount. Because Stray is entirely self-hosted, our promotional website (stray.bcnstudio.tech) does not collect, monitor, transmit, store, or share any personal user data.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">2. Token & Credentials Protection</h2>
            <p>
              Your Discord authorization token never touches our servers. The token is stored locally on your own computer, board, or database instance. When using the self-hosted Stray Dashboard, token credentials are encrypted locally using AES-256-GCM algorithms, with decryption keys stored exclusively inside your personal environment parameters.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">3. Direct Gateway Connections</h2>
            <p>
              The Stray daemon establishes direct WebSocket sockets to the official Discord gateway endpoints (wss://gateway.discord.gg). No proxy, intermediary, or remote logging services are used to tunnel your gateway traffic.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">4. Web Server Logs</h2>
            <p>
              Our hosting provider for stray.bcnstudio.tech may log generic, anonymous server statistics (such as IP address, browser headers, and page view metrics) for standard traffic metrics and security purposes. These logs contain no personal metadata and are never aggregated or shared.
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
