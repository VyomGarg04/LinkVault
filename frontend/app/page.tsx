import Link from 'next/link';
import { ArrowRight, Shield, Zap, Palette } from 'lucide-react';
import DataFlowBackground from './components/DataFlowBackground';

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* Premium Data Flow Background */}
      <DataFlowBackground />

      <nav className="border-b border-white/5 bg-black/30 backdrop-blur-xl relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">Link</span>
              <span className="text-green-500">Vault</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-green-500 transition-all group-hover:w-full"></span>
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-lg hover:bg-slate-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-4 pt-20 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">The Future of Link Management</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-none text-white">
            One Link to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">Rule Them All</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Create a <span className="text-white font-medium">stunning, intelligent</span> link hub in seconds.
            Track analytics, automate visibility with rules, and stand out with premium themes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center">
                Create Your Hub
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-lg font-bold rounded-xl border border-white/10 backdrop-blur-md transition-all hover:border-white/20"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
          {[
            { icon: Palette, title: "Premium Themes", desc: "Fully customizable aesthetics with glassmorphism support." },
            { icon: Shield, title: "Smart Rules", desc: "Show links based on time, device, or location automatically." },
            { icon: Zap, title: "Instant Analytics", desc: "Real-time insights on clicks, location, and device types." }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-500 hover:border-green-500/30 hover:bg-white/[0.07]">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl mb-6 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Link Vault. Crafted for perfection.
          </p>
        </div>
      </footer>
    </div>
  );
}
