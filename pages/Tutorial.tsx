
import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-16 scale-95'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Tutorial: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const totalHeight = mainElement.scrollHeight - mainElement.clientHeight;
        const currentScroll = mainElement.scrollTop;
        setScrollProgress((currentScroll / totalHeight) * 100);
      }
    };

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }
    return () => mainElement?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-16 pb-40 relative">
      {/* Protocol Sync Progress Indicator */}
      <div className="fixed top-20 left-0 right-0 h-1 z-50 bg-zinc-100 dark:bg-zinc-900 pointer-events-none">
        <div 
          className="h-full bitcoin-gradient transition-all duration-300 ease-out shadow-[0_0_10px_rgba(247,147,26,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header className="space-y-6 text-center pt-8 animate-in fade-in zoom-in duration-1000">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-bitcoin/10 rounded-[32px] flex items-center justify-center mx-auto border-2 border-bitcoin/30 shadow-2xl relative z-10">
            <i className="fa-solid fa-book-open-reader text-bitcoin text-4xl animate-pulse"></i>
          </div>
          <div className="absolute inset-0 bg-bitcoin/20 blur-3xl rounded-full scale-150 -z-10 animate-pulse-slow"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-zinc-900 dark:text-white">Field Manual</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-bitcoin/30"></span>
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Protocol Specification v4.0.2</p>
            <span className="h-px w-8 bg-bitcoin/30"></span>
          </div>
        </div>
      </header>

      <section className="space-y-12 px-2">
        {/* Card 1 */}
        <ScrollReveal>
          <div className="group bg-white dark:bg-zinc-900 rounded-[48px] p-10 border border-zinc-100 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden hover:border-bitcoin/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <i className="fa-solid fa-dumbbell text-9xl"></i>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-bitcoin rounded-[24px] flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                <i className="fa-solid fa-dumbbell text-2xl"></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-bitcoin uppercase tracking-widest block mb-1">Module Alpha</span>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">01. Proof of Work</h3>
              </div>
            </div>
            
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              In BitFitness, weight is energy. Reps are computation. To secure the network (your body), you must perform kinetic work. Every exercise logged is a <span className="text-bitcoin font-bold italic">"Block"</span> added to your personal chain.
            </p>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <i className="fa-solid fa-shield-halved text-bitcoin text-xs"></i>
                <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest">Network Requirement</span>
              </div>
              <p className="text-xs font-bold text-zinc-500 leading-normal uppercase">Broadcast physical signals daily to maintain your <span className="text-zinc-900 dark:text-white">uptime streak</span>.</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2 */}
        <ScrollReveal>
          <div className="group bg-white dark:bg-zinc-900 rounded-[48px] p-10 border border-zinc-100 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden hover:border-bitcoin/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 text-zinc-900 dark:text-white">
              <i className="fa-solid fa-tower-broadcast text-9xl"></i>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[24px] flex items-center justify-center shadow-xl -rotate-3 group-hover:rotate-0 transition-transform">
                <i className="fa-solid fa-tower-broadcast text-2xl"></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Module Beta</span>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">02. Signal Consensus</h3>
              </div>
            </div>

            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Don't trust, verify. Sharing your work on X provides social proof. The validator network (other nodes) audits your proof-of-work link before <span className="text-green-500 font-bold italic">confirming</span> the block in the global ledger.
            </p>

            <div className="flex flex-wrap gap-3">
              {['Verified', 'Rejected', 'Pending'].map((status) => (
                <div key={status} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Verified' ? 'bg-green-500' : status === 'Rejected' ? 'bg-red-500' : 'bg-zinc-400 animate-pulse'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Card 3 */}
        <ScrollReveal>
          <div className="group bg-white dark:bg-zinc-900 rounded-[48px] p-10 border border-zinc-100 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden hover:border-bitcoin/30 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 text-bitcoin">
              <i className="fa-solid fa-hammer text-9xl"></i>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-bitcoin/20 rounded-[24px] flex items-center justify-center text-bitcoin shadow-xl rotate-6 group-hover:rotate-0 transition-transform border border-bitcoin/20">
                <i className="fa-solid fa-hammer text-2xl"></i>
              </div>
              <div>
                <span className="text-[10px] font-black text-bitcoin uppercase tracking-widest block mb-1">Module Gamma</span>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white">03. Forge Quests</h3>
              </div>
            </div>

            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The network thrives on decentralization. Anyone can <span className="text-bitcoin font-bold italic">"Forge"</span> a new fitness protocol. Define the reps, define the goal, and broadcast it to the global quest pool.
            </p>
            
            <div className="flex items-center gap-4 py-4 border-t border-zinc-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-bitcoin/10 flex items-center justify-center text-bitcoin">
                <i className="fa-solid fa-users text-xs"></i>
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
                Quests are smart contracts for movement. Collaborative health through competitive signals.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal delay={200}>
        <div className="px-2 pt-8">
          <button 
            onClick={onDismiss}
            className="w-full py-8 bitcoin-gradient text-white rounded-[40px] font-black uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(247,147,26,0.5)] active:scale-95 transition-all text-xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
            <span className="relative z-10 flex items-center justify-center gap-4">
              I Understand the Protocol
              <i className="fa-solid fa-arrow-right text-base animate-bounce-x"></i>
            </span>
          </button>
        </div>
      </ScrollReveal>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
