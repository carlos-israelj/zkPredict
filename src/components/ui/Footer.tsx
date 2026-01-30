// src/components/ui/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative py-8 px-4 text-sm bg-base-200/50 backdrop-blur-xl border-t border-cyan-500/20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 relative z-10">
        <p className="font-mono text-base-content/70">
          &copy; {new Date().getFullYear()} Made by{" "}
          <a
            href="https://venomlabs.xyz"
            className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            VenomLabs
          </a>
        </p>
        <div className="flex items-center space-x-6">
          <Link href="/privacy-policy" className="text-base-content/70 hover:text-cyan-400 transition-colors duration-300 font-mono text-xs">
            Privacy Policy
          </Link>

          <Link href="/terms" className="text-base-content/70 hover:text-cyan-400 transition-colors duration-300 font-mono text-xs">
            Terms & Conditions
          </Link>
          <Link href="/whitepaper" className="text-base-content/70 hover:text-cyan-400 transition-colors duration-300 font-mono text-xs">
            White Paper
          </Link>
          <a
            href="https://buymeacoffee.com/michaelvenu"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm border-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-base-100 font-bold transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/50"
          >
            Donate
          </a>
        </div>
      </div>
    </footer>
  );
}
