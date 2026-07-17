import Link from "next/link";

export default function TermsOfService() {
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
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-8">Terms of Service</h1>
        <p className="text-zinc-500 text-xs mb-6">Last Updated: July 2026</p>

        <div className="flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed font-medium">
          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">1. Nature of the Software</h2>
            <p>
              Stray is an open-source, self-hosted developer tool designed to customize personal Discord presence states. We provide the source code solely for educational, testing, and private noncommercial purposes. We do not operate, host, or control any servers, database connections, or active Discord gateway instances for our users.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">2. Self-Hosting & Account Safety</h2>
            <p>
              By cloning, building, or compiling Stray, you acknowledge that you are running the daemon on your own infrastructure. You assume full accountability and responsibility for the security of your Discord account tokens and configuration settings.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">3. Compliance with Third-Party Terms</h2>
            <p>
              Using selfbots, automated user accounts, or custom API gateway connection properties is a violation of the Discord Terms of Service (ToS) and Developer Terms. You understand that executing this software on your personal account risks token invalidation, account restrictions, or permanent account termination by Discord. We assume zero liability for actions taken by Discord against your account.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">4. Noncommercial Restrictions</h2>
            <p>
              Stray is distributed under the PolyForm Noncommercial License 1.0.0. You may use, edit, and distribute this software for personal, hobbyist, and academic projects. You may not lease, resell, or exploit this software for commercial gain, paid hosting services, or monetary compensation without entering a separate agreement.
            </p>
          </section>

          <section className="bg-[#1a1a1e] border-2 border-zinc-800 rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-black text-white mb-2 uppercase">5. Disclaimer of Warranties</h2>
            <p>
              THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
