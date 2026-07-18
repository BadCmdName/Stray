import Link from "next/link";

const CheckIcon = () => (
  <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const BoltIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DeviceIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#16161a] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-9 w-9" />
          <span className="text-xl font-black tracking-wider text-white uppercase">STRAY ALLEY</span>
        </div>
        <nav className="flex items-center gap-6 text-xs font-black uppercase text-zinc-400">
          <Link href="/downloads" className="hover:text-amber-500 transition">Downloads</Link>
          <Link href="/changelog" className="hover:text-amber-500 transition">Changelog</Link>
          <a href="https://github.com/BadCmdName/Stray" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition">GitHub</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-28 px-8 text-center flex flex-col items-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-400 border-2 border-black text-xs font-black text-black uppercase tracking-wider mb-8 rotate-[-1deg] shadow-[2.5px_2.5px_0px_0px_#000]">
            stray.bcnstudio.tech
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight text-white mb-6 uppercase tracking-tight">
            Custom Presence <span className="text-amber-400 underline decoration-wavy decoration-amber-500/60">Playground</span>
          </h1>
          
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mb-10 leading-relaxed font-medium">
            Stray Alley is an open-source, self-hosted Discord presence customizer. Log in with secure Discord OAuth2 authorization, encrypt account tokens in your database, and manage spoofed presence connections directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <Link
              href="/downloads"
              className="bg-amber-400 border-2 border-black text-black px-8 py-4 rounded-xl font-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-xs uppercase tracking-wider"
            >
              Download Files
            </Link>
            <a
              href="https://github.com/BadCmdName/Stray"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#16161a] border-2 border-zinc-800 text-zinc-350 hover:text-white px-8 py-4 rounded-xl font-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-xs uppercase tracking-wider"
            >
              GitHub Source
            </a>
          </div>
        </section>

        <section className="py-24 px-8 bg-[#131316] border-t-4 border-zinc-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center text-white mb-16 uppercase tracking-wider">
              Core Architecture
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-11 w-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center mb-6">
                  <BoltIcon />
                </div>
                <h3 className="text-base font-black text-white mb-2 uppercase">Bun Native</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Runs directly inside Bun. Highly responsive WebSocket handshakes and near-zero memory footprint.
                </p>
              </div>

              <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-11 w-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center mb-6">
                  <DeviceIcon />
                </div>
                <h3 className="text-base font-black text-white mb-2 uppercase">Spoofing Options</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Modify identified gateway headers. Spoof active client connections as mobile, desktop, web, or console layout profiles.
                </p>
              </div>

              <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
                <div className="h-11 w-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center mb-6">
                  <LockIcon />
                </div>
                <h3 className="text-base font-black text-white mb-2 uppercase">Strict Privacy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  100% self-hosted database storage. Symmetric AES-256-GCM encryption keeps credentials safe inside your local environment parameters.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-8 max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-black text-center text-white mb-16 uppercase tracking-wider">
            Self-Hosted Alley Features
          </h2>
          
          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-black text-white mb-4 uppercase">Stray Alley Features</h3>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed font-medium">
              An all-in-one web portal to manage your Discord Presence profiles visually. Configure the core parameters, test settings, and deploy gateway clients in the background.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-350 font-medium mb-8">
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Discord OAuth2 User Authentication</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Secure AES-256-GCM token storage</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Save Changes & Publish buttons</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Real-time presence card previewer</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Bun native background worker client</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckIcon />
                <span>Docker container compose templates</span>
              </li>
            </ul>
            <Link href="/downloads" className="inline-block text-center px-8 py-3 bg-amber-400 border-2 border-black text-black rounded-xl font-black uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
              Download Files
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#131316] px-8 py-10 flex flex-col md:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
        <div>
          <p>© {new Date().getFullYear()} Stray. Licensed under the PolyForm Noncommercial License.</p>
          <p className="mt-1">All presence integrations must be run on your own self-hosted environments.</p>
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
