import Link from "next/link";

const PackageIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DockerIcon = () => (
  <svg className="h-6 w-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

export default function Downloads() {
  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#16161a] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-9 w-9" />
          <span className="text-xl font-black tracking-wider text-white uppercase">STRAY</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-black uppercase text-zinc-400">
          <Link href="/downloads" className="text-amber-400">Downloads</Link>
          <Link href="/changelog" className="hover:text-amber-400 transition">Changelog</Link>
          <a href="https://github.com/BadCmdName/Stray" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">GitHub</a>
        </nav>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-16 flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Adopt your Stray
          </h1>
          <p className="text-xs md:text-sm text-zinc-450 max-w-lg mx-auto font-medium">
            Retrieve the source files and run the setup scripts on your local infrastructure. We provide zero host database storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 bg-amber-400 rounded-lg border-2 border-black flex items-center justify-center mb-4">
                <PackageIcon />
              </div>
              <h2 className="text-lg font-black text-white mb-2 uppercase">Stray Skeletal</h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">
                The lightweight daemon. Ideal for low-memory environments, containers, or direct execution via Bun.
              </p>
              
              <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl text-[10px] font-mono text-zinc-300 overflow-x-auto mb-6">
{`# Setup local daemon
git clone https://github.com/BadCmdName/Stray.git
cd Stray/packages/skeletal
cp stray.config.json.example stray.config.json
bun install
bun start`}
              </pre>
            </div>
            
            <a
              href="https://github.com/BadCmdName/Stray/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 bg-amber-400 border-2 border-black text-black rounded-xl font-black uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Download Files
            </a>
          </div>

          <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 bg-amber-400 rounded-lg border-2 border-black flex items-center justify-center mb-4">
                <DashboardIcon />
              </div>
              <h2 className="text-lg font-black text-white mb-2 uppercase">Stray Dashboard</h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">
                The visual dashboard app. Run this self-hosted panels template to manage active presence variables visually.
              </p>

              <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl text-[10px] font-mono text-zinc-300 overflow-x-auto mb-6">
{`# Setup visual panel
cd Stray/packages/dashboard
bun install
bun run dev`}
              </pre>
            </div>

            <a
              href="https://github.com/BadCmdName/Stray"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 bg-[#0e0e11] border-2 border-zinc-800 text-zinc-200 hover:text-white rounded-xl font-bold uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Download Files
            </a>
          </div>
        </div>

        <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-amber-400 rounded-lg border-2 border-black flex items-center justify-center">
              <DockerIcon />
            </div>
            <h2 className="text-lg font-black text-white uppercase">Docker Compose Configuration</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-medium">
            Run the daemon inside an isolated alpine container by copying this compose file:
          </p>
          <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto">
{`version: '3.8'
services:
  stray-skeletal:
    image: bun:1.0-alpine
    volumes:
      - ./stray.config.json:/app/stray.config.json
    restart: always`}
          </pre>
        </div>
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#131316] px-8 py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Stray. Licensed under the PolyForm Noncommercial License.</p>
      </footer>
    </div>
  );
}
