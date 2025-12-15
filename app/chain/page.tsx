"use client"

import React from 'react';
import { Shield, Zap, Network, CheckCircle, XCircle, ArrowRight, Lock, Scale, Check, X } from 'lucide-react';

import TrueFocus from '@/components/ui/TrueFocus';
import { MagicBentoGrid, MagicCard } from '../../components/ui/MagicBento';
import { HowItWorksSection } from '@/components/pages/chain/how-it-works';
import { useRouter } from 'next/navigation';

export default function ChainPage() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const words = ["Mainnet", "Testnet", "Devnet"];

  React.useEffect(() => {
    // Start animation sequence after mount
    const timer1 = setTimeout(() => setIsExpanded(true), 500); // Expand
    const timer2 = setTimeout(() => setIsExpanded(false), 2500); // Retract after 2s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleWordClick = (index: number) => {
      if (index === 0) router.push('/chain/mainnet');
      if (index === 1) router.push('/chain/testnet');
      if (index === 2) router.push('/chain/devnet');
  };

  return (
    <div className="relative py-12 md:py-20 space-y-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO SECTION */}
        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center -mt-24 mb-12">
          
          {/* Animated FACINET -> FACILITATOR NETWORK Title */}
          <div className="group cursor-default flex flex-col items-center gap-4 select-none">
             <div className="flex items-center text-5xl md:text-8xl font-bold font-mono tracking-widest italic transform -skew-x-12 text-white transition-all duration-500">
                {/* PART 1: FACI -> FACILITATOR */}
                <div className="flex">
                   <span className={`transition-colors duration-500 ${isExpanded ? 'text-blue-400' : 'text-white group-hover:text-blue-400'}`}>FACI</span>
                   <span 
                     className={`overflow-hidden transition-all duration-1000 ease-in-out whitespace-nowrap text-white ${
                       isExpanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[600px] group-hover:opacity-100'
                     }`}
                   >
                      LITATOR
                   </span>
                </div>
                
                {/* SEPARATOR */}
                <div className={`transition-all duration-500 ${isExpanded ? 'w-8' : 'w-0 group-hover:w-8'}`}></div>

                {/* PART 2: NET -> NETWORK */}
                <div className="flex">
                   <span className={`transition-colors duration-500 ${isExpanded ? 'text-blue-400' : 'text-white group-hover:text-blue-400'}`}>NET</span>
                   <span 
                     className={`overflow-hidden transition-all duration-1000 ease-in-out whitespace-nowrap text-white ${
                       isExpanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[600px] group-hover:opacity-100'
                     }`}
                   >
                      WORK
                   </span>
                </div>
             </div>
             
             {/* Subtext: TrueFocus Component */}
             <div className="mt-12 scale-75 md:scale-100">
                <TrueFocus 
                   words={words}
                   manualMode={true}
                   blurAmount={5}
                   borderColor="#3b82f6" // blue-500
                   animationDuration={0.3}
                   pauseBetweenAnimations={0.5}
                   onWordClick={handleWordClick}
                   className="text-[0.8rem] md:text-[1.25rem]"
                />
             </div>
          </div>

          <p className="text-xl text-white/60 font-light leading-relaxed max-w-3xl mx-auto mt-12">
            Facinet Chain provides a single, verifiable source of truth for decentralized X402 execution across chains. By separating execution from accountability, it makes gasless, multi-chain payments scalable, transparent, and trust-minimized.
          </p>
        </div>

        {/* 2. WHAT THIS LAYER DOES / DOES NOT DO - BENTO GRID */}
        <div className="min-h-screen flex items-center justify-center mb-32">
           <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full items-stretch">
              
              {/* LEFT COLUMN: What This Layer Does NOT Do */}
              <div className="flex flex-col h-full gap-4">
                  {/* Header */}
                  <div className="p-6 space-y-4 text-center">
                     <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight leading-snug">
                        <span className="text-red-500">What It Does NOT Do</span>
                     </h2>

                  </div>

                  <MagicBentoGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start" glowColor="239, 68, 68">
                     {/* 0. Banner Card (Security) - Matches Height of Canonical Card */}
                    <MagicCard 
                      className="group md:col-span-2 p-8 rounded-3xl bg-red-500/[0.03] border border-red-500/20 overflow-hidden min-h-[240px]" 
                      glowColor="239, 68, 68"
                      enableTilt={false}
                    >
                       <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                       <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                   <Shield size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-white font-mono group-hover:text-red-400 transition-colors">Security by Design</h3>
                             </div>
                             <p className="text-white/60 text-base leading-relaxed mb-6">
                                By doing less, we secure more. No complex logic risks.
                             </p>
                          </div>
                          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                             <div className="flex justify-between w-full text-xs font-mono text-white/50 uppercase tracking-widest">
                                <span>• Scope: Ltd</span>
                                <span>• Logic: None</span>
                                <span>• Risk: Zero</span>
                                <span>• Trustless</span>
                             </div>
                          </div>
                       </div>
                    </MagicCard>

                    {/* Not 1 */}
                    <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="239, 68, 68" enableTilt={false}>
                       <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-red-400 transition-colors">No Fund Movement</h3>
                       <p className="text-white/50 text-sm leading-relaxed flex-grow">
                          Assets never touch this layer. Settlement is external.
                       </p>
                    </MagicCard>

                    {/* Not 2 */}
                    <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="239, 68, 68" enableTilt={false}>
                       <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-red-400 transition-colors">No Execution</h3>
                       <p className="text-white/50 text-sm leading-relaxed flex-grow">
                          Facilitators execute on L1s. We only record it.
                       </p>
                    </MagicCard>

                    {/* Not 3 */}
                    <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="239, 68, 68" enableTilt={false}>
                       <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-red-400 transition-colors">No Custody</h3>
                       <p className="text-white/50 text-sm leading-relaxed flex-grow">
                          No pooled balances or custodial risks ever.
                       </p>
                    </MagicCard>

                    {/* Not 4 */}
                    <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="239, 68, 68" enableTilt={false}>
                       <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-red-400 transition-colors">No Overrides</h3>
                       <p className="text-white/50 text-sm leading-relaxed flex-grow">
                          Cannot alter on-chain reality. Only reflects it.
                       </p>
                    </MagicCard>
                  </MagicBentoGrid>
              </div>

              {/* RIGHT COLUMN: What This Layer Does (Now GREEN) */}
              <div className="flex flex-col h-full gap-4">
                 {/* Header */}
                 <div className="p-6 space-y-4 text-center">
                     <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight leading-snug">
                        <span className="text-green-500">What This Layer Does</span>
                     </h2>

                 </div>

                 <MagicBentoGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start" glowColor="34, 197, 94">
                     {/* 1. Canonical Execution Records (Large - GREEN Theme) */}
                     <MagicCard 
                        className="group md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden min-h-[240px]"
                        glowColor="34, 197, 94"
                        enableTilt={false}
                     >
                         <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />
                         <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                               <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                                     <CheckCircle size={20} />
                                  </div>
                                  <h3 className="text-2xl font-bold text-white font-mono group-hover:text-green-400 transition-colors">Canonical Execution Records</h3>
                               </div>
                               <p className="text-white/60 text-base leading-relaxed mb-6">
                                  Single source of truth ledger for all cross-chain activity.
                               </p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                               <div className="flex justify-between w-full text-xs font-mono text-white/50 uppercase tracking-widest">
                                  <span>• Facilitator ID</span>
                                  <span>• Chain</span>
                                  <span>• Tx Hash</span>
                                  <span>• Time</span>
                               </div>
                            </div>
                         </div>
                     </MagicCard>

                     {/* 2. Accountability */}
                     <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="34, 197, 94" enableTilt={false}>
                        <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-green-400 transition-colors">Accountability</h3>
                        <p className="text-white/50 text-sm leading-relaxed flex-grow">
                           Tracks success, latency, and uptime for reputation.
                        </p>
                     </MagicCard>

                     {/* 3. Final Judgment */}
                     <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="34, 197, 94" enableTilt={false}>
                        <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-green-400 transition-colors">Final Judgment</h3>
                        <p className="text-white/50 text-sm leading-relaxed flex-grow">
                           Objective slashing for dishonest behavior.
                        </p>
                     </MagicCard>

                     {/* 4. Verification */}
                     <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="34, 197, 94" enableTilt={false}>
                        <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-green-400 transition-colors">Verification</h3>
                        <p className="text-white/50 text-sm leading-relaxed flex-grow">
                           One API to verify execution on any chain.
                        </p>
                     </MagicCard>

                     {/* 5. Coordination */}
                     <MagicCard className="group p-6 rounded-3xl bg-white/5 border border-white/10" glowColor="34, 197, 94" enableTilt={false}>
                        <h3 className="text-lg font-bold text-white font-mono mb-2 group-hover:text-green-400 transition-colors">Coordination</h3>
                        <p className="text-white/50 text-sm leading-relaxed flex-grow">
                           Global loads and analytics data.
                        </p>
                     </MagicCard>
                 </MagicBentoGrid>
              </div>

           </div>
        </div>

        {/* 3. HOW IT WORKS */}
        <HowItWorksSection />

      </div>
    </div>
  );
}
