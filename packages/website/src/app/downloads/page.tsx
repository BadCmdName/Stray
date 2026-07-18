import Link from "next/link";

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
          <span className="text-xl font-black tracking-wider text-white uppercase">STRAY ALLEY</span>
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

        <div className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-amber-400 rounded-lg border-2 border-black flex items-center justify-center">
              <DashboardIcon />
            </div>
            <h2 className="text-xl font-black text-white uppercase">Stray Alley Setup Guide</h2>
          </div>

          <div className="flex flex-col gap-6 text-xs text-zinc-350 leading-relaxed font-medium">
            <div>
              <h3 className="text-sm font-black text-white uppercase mb-2">1. Clone & Install</h3>
              <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl font-mono text-zinc-300 overflow-x-auto">
{`git clone https://github.com/BadCmdName/Stray.git
cd Stray/packages/alley
bun install`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-black text-white uppercase mb-2">2. Environment Credentials</h3>
              <p className="mb-2">Create a `.env` file in `packages/alley/` with the following parameters:</p>
              <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl font-mono text-zinc-300 overflow-x-auto">
{`DATABASE_URL="postgresql://user:pass@localhost:5432/stray"
ENCRYPTION_KEY="your_32_bytes_hex_encryption_key"
JWT_SECRET="your_secure_session_secret"
DISCORD_CLIENT_ID="your_discord_application_id"
DISCORD_CLIENT_SECRET="your_discord_application_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/callback"
ALLOWED_USER_IDS="1018195507560063039,another_discord_id"`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-black text-white uppercase mb-2">3. Setup Database & Run</h3>
              <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl font-mono text-zinc-300 overflow-x-auto">
{`bunx prisma db push
bun run dev`}
              </pre>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="https://github.com/BadCmdName/Stray/archive/refs/heads/main.zip"
              className="inline-block text-center px-8 py-3.5 bg-amber-400 border-2 border-black text-black rounded-xl font-black uppercase transition text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
            <h2 className="text-lg font-black text-white uppercase">Docker Compose Deployment</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-4 font-medium">
            Alternatively, deploy using Docker Compose with environment bindings:
          </p>
          <pre className="bg-[#0e0e11] border border-zinc-850 p-4 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto">
{`version: '3.8'
services:
  stray-alley:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/stray
      - ENCRYPTION_KEY=your_key
      - JWT_SECRET=your_secret
      - DISCORD_CLIENT_ID=your_id
      - DISCORD_CLIENT_SECRET=your_secret
      - DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
      - ALLOWED_USER_IDS=your_discord_user_id
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
