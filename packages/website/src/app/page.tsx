import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#1a1a1e] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-10 w-10" />
          <span className="text-2xl font-black tracking-wider text-white uppercase">STRAY</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-black uppercase text-zinc-400">
          <Link href="/downloads" className="hover:text-amber-400 transition">Downloads</Link>
          <Link href="/changelog" className="hover:text-amber-400 transition">Changelog</Link>
          <a href="https://github.com/BadCmdName/Stray" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">GitHub</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-24 px-8 text-center flex flex-col items-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-400 border-2 border-black text-xs font-black text-black uppercase tracking-wider mb-6 rotate-[-1deg] shadow-[2px_2px_0px_0px_#000]">
            🐾 stray.bcnstudio.tech
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white mb-6 uppercase tracking-tight">
            Claim Your own <span className="text-amber-400 underline decoration-wavy decoration-amber-500">Presence</span>
          </h1>
          
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed font-medium">
            Stray is an ultra-fast, self-hosted Discord Presence manager. Spoof your active status as Mobile, Desktop, Web, or Xbox console, and broadcast custom rich activities. Totally private, open-source, and running on your own terms.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <Link
              href="/downloads"
              className="bg-amber-400 border-2 border-black text-black px-8 py-4 rounded-xl font-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-sm uppercase tracking-wider"
            >
              Get Stray 🐾
            </Link>
            <a
              href="https://github.com/BadCmdName/Stray"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a1a1e] border-2 border-zinc-800 text-zinc-300 hover:text-white px-8 py-4 rounded-xl font-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-sm uppercase tracking-wider"
            >
              GitHub Code
            </a>
          </div>
        </section>

        <section className="py-20 px-8 bg-[#16161a] border-t-4 border-zinc-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center text-white mb-16 uppercase tracking-wider">
              🐾 Why Stray?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-12 w-12 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-2xl mb-6">
                  ⚡
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase">Bun Powered</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Built natively on top of Bun WebSockets. Zero heavy node_modules payload and near-zero memory footprint.
                </p>
              </div>

              <div className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-12 w-12 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-2xl mb-6">
                  📱
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase">Device Spoofing</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Switch active device indicators. Display a mobile active status, web browser state, or Xbox console tag instantly on Discord.
                </p>
              </div>

              <div className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-12 w-12 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-2xl mb-6">
                  🔒
                </div>
                <h3 className="text-lg font-black text-white mb-2 uppercase">Full Ownership</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  We don&apos;t store your Discord tokens. Setup PostgreSQL locally and encrypt your credentials with personal server key strings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-8 max-w-6xl mx-auto w-full">
          <h2 className="text-3xl font-black text-center text-white mb-16 uppercase tracking-wider">
            Choose Your Setup
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
              <div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Version A</span>
                <h3 className="text-2xl font-black text-white mb-4 uppercase">Stray Skeletal</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-medium">
                  A pure, headless Discord gateway process running on Bun. Perfect for Raspberry Pi, low-cost VPS instances, or Docker runtimes. Uses a simple JSON config file.
                </p>
                <ul className="text-sm text-zinc-300 flex flex-col gap-3 mb-8 font-medium">
                  <li className="flex items-center gap-2">🐈 Zero dependency runtime footprint</li>
                  <li className="flex items-center gap-2">🐈 Auto-reconnect on socket dropouts</li>
                  <li className="flex items-center gap-2">🐈 Complete Docker compose bindings</li>
                  <li className="flex items-center gap-2">🐈 Native cross-platform executable compile</li>
                </ul>
              </div>
              <Link href="/downloads" className="w-full text-center py-3 bg-[#121214] border-2 border-zinc-800 text-zinc-200 hover:text-white rounded-xl font-bold uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                Skeletal Setup
              </Link>
            </div>

            <div className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
              <div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Version B</span>
                <h3 className="text-2xl font-black text-white mb-4 uppercase">Stray Dashboard</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed font-medium">
                  A beautiful self-hosted panel managing multiple daemon configurations visually. Perfect for web domains. Includes real-time profile previewing.
                </p>
                <ul className="text-sm text-zinc-300 flex flex-col gap-3 mb-8 font-medium">
                  <li className="flex items-center gap-2">🐈 Live interactive profile card mockup</li>
                  <li className="flex items-center gap-2">🐈 AES-256-GCM database credentials cipher</li>
                  <li className="flex items-center gap-2">🐈 Simple user profile and presets manager</li>
                  <li className="flex items-center gap-2">🐈 API routes mapping to background daemons</li>
                </ul>
              </div>
              <Link href="/downloads" className="w-full text-center py-3 bg-amber-400 border-2 border-black text-black rounded-xl font-black uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                Dashboard Setup
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#16161a] px-8 py-10 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div>
          <p>© {new Date().getFullYear()} Stray. Licensed under the PolyForm Noncommercial License.</p>
          <p className="mt-1">All presence connections run inside your own self-hosted environments.</p>
        </div>
        <div className="flex items-center gap-6 font-bold uppercase">
          <Link href="/disclaimer" className="hover:text-zinc-300 transition">Disclaimer</Link>
          <Link href="/tos" className="hover:text-zinc-300 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
