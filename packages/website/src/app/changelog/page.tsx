import Link from "next/link";

export default function Changelog() {
  const logs = [
    {
      version: "v1.1.0",
      date: "July 17, 2026",
      title: "Self-Hosted Dashboard & Visual Previews",
      changes: [
        "Added visual dashboard client built on Next.js App Router.",
        "Implemented secure AES-256-GCM token encryption helpers.",
        "Created background process spawning engine connecting UI with daemon instances.",
        "Added live visual Discord profile card markup mockups.",
        "Cleaned and standardized terminal logs prefixed with 'Stray: '."
      ]
    },
    {
      version: "v1.0.0",
      date: "July 17, 2026",
      title: "Initial Skeletal Release",
      changes: [
        "Ported Python-based Discord selfbot gateway connections to Bun-native WebSockets.",
        "Added device status identifiers spoofing support (Desktop, Mobile, Web, Xbox).",
        "Implemented dynamic image URLs registration via the Discord external assets endpoint.",
        "Added docker-compose and multi-stage Docker build templates.",
        "Licensed under the PolyForm Noncommercial License 1.0.0."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#1a1a1e] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-10 w-10" />
          <span className="text-2xl font-black tracking-wider text-white uppercase">STRAY</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-black uppercase text-zinc-400">
          <Link href="/downloads" className="hover:text-amber-400 transition">Downloads</Link>
          <Link href="/changelog" className="text-amber-400">Changelog</Link>
          <a href="https://github.com/BadCmdName/Stray" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">GitHub</a>
        </nav>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-3">Changelog</h1>
          <p className="text-xs text-zinc-400 font-medium">
            Release logs and repository iterations for Stray. Verify commits on our{" "}
            <a href="https://github.com/BadCmdName/Stray" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold">GitHub Repository</a>.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {logs.map((log) => (
            <div key={log.version} className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-lg font-black text-white uppercase tracking-wider">{log.version}</span>
                <span className="text-xs font-bold text-zinc-500">{log.date}</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">{log.title}</h3>
                <ul className="text-xs text-zinc-450 flex flex-col gap-2.5 font-medium list-inside list-disc">
                  {log.changes.map((change, idx) => (
                    <li key={idx} className="leading-relaxed">{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#16161a] px-8 py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Stray. Licensed under the PolyForm Noncommercial License.</p>
      </footer>
    </div>
  );
}
