"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GithubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export default function Changelog() {
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/repos/BadCmdName/Stray/commits?sha=main")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCommits(data.slice(0, 15));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-100 flex flex-col font-sans select-none">
      <header className="border-b-4 border-zinc-900 bg-[#16161a] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/Stray.svg" alt="Stray Logo" className="h-9 w-9" />
          <span className="text-xl font-black tracking-wider text-white uppercase">STRAY</span>
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
            Dynamic release logs fetched from our{" "}
            <a href="https://github.com/BadCmdName/Stray/commits/main/" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold">GitHub Commit History</a>.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fetching Commits...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/20 border-2 border-rose-900 text-rose-350 p-6 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)] text-center">
            <h3 className="text-base font-black mb-2 uppercase">Failed to retrieve changelog</h3>
            <p className="text-xs mb-4 font-medium">Rate limits or network issues might be blocking direct GitHub API requests.</p>
            <a
              href="https://github.com/BadCmdName/Stray/commits/main/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 bg-rose-900 border-2 border-black text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              View commits on GitHub
            </a>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {commits.map((c) => {
              const lines = c.commit.message.split("\n");
              const title = lines[0];
              const descriptionLines = lines.slice(1).filter((line) => line.trim() !== "");
              const shortSha = c.sha.substring(0, 7);
              const formattedDate = new Date(c.commit.author.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={c.sha} className="bg-[#16161a] border-2 border-zinc-800 rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.4)] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-amber-400 hover:text-amber-500 font-bold border border-zinc-800 bg-[#0e0e11] px-2.5 py-1 rounded-lg transition"
                    >
                      {shortSha}
                    </a>
                    <span className="text-[10px] font-bold text-zinc-500">{formattedDate}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">{title}</h3>
                    {descriptionLines.length > 0 && (
                      <div className="text-xs text-zinc-400 flex flex-col gap-1.5 font-medium leading-relaxed bg-[#0e0e11] p-3.5 border border-zinc-850 rounded-xl font-mono whitespace-pre-line">
                        {descriptionLines.join("\n")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t-4 border-zinc-900 bg-[#131316] px-8 py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Stray. Licensed under the PolyForm Noncommercial License.</p>
      </footer>
    </div>
  );
}
