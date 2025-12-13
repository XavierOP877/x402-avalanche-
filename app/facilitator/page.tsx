"use client"

import Link from "next/link"
import { ShieldCheck, Server, Activity, Wallet, Clock, ArrowRight, Terminal, Cloud, X } from "lucide-react"
import { useState } from "react"

export default function FacilitatorPage() {
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployStep, setDeployStep] = useState(1)
  const [facilitatorName, setFacilitatorName] = useState("")
  const [paymentAddress, setPaymentAddress] = useState("0x71C...9A23") // Mock default connected wallet

  return (
    <div className="relative py-12 md:py-24 space-y-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-3 text-primary mb-4">
             <div className="h-px w-8 bg-primary/50" />
             <span className="text-xs font-mono uppercase tracking-widest text-primary/80">Network Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
            Facilitator Network
          </h1>
          <p className="text-xl text-white/50 max-w-2xl font-light leading-relaxed">
            The backbone of the autonomous economy. Run a node, earn fees, and secure agent transactions.
          </p>
        </div>

        {/* 1. NETWORK STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-24">
          <StatCard label="Active Nodes" value="0" icon={Server} color="text-green-400" />
          <StatCard label="Total Staked" value="$0" icon={Wallet} color="text-purple-400" />
          <StatCard label="Fees Generated" value="$0" icon={Activity} color="text-blue-400" />
          <StatCard label="Transactions" value="0" icon={ArrowRight} color="text-orange-400" />
          <StatCard label="Network Uptime" value="0%" icon={Clock} color="text-white" />
        </div>

        {/* 2. RUN OPTIONS (CLI vs CLOUD) */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
           {/* Option A: CLI */}
           <div className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="h-12 w-12 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center">
                    <Terminal className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight mb-2">Run via CLI</h3>
                    <p className="text-white/60 font-light">Set up a node on your own hardware using our command line interface. Maximum control.</p>
                 </div>
                 <div className="bg-black/50 rounded-lg p-4 border border-white/10 font-mono text-xs text-white/70">
                    $ npm install -g @facinet/cli<br/>
                    $ facinet start --network=mainnet
                 </div>
                 <button className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider hover:text-white transition-colors">
                    View Documentation <ArrowRight size={14} />
                 </button>
              </div>
           </div>

           {/* Option B: Cloud (Highlighted) */}
           <div className="group relative p-1 rounded-2xl overflow-hidden">
              {/* Rotating Gradient Border */}
              <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#ffffff_50%,#000000_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0.5 rounded-2xl bg-black" />
              
              {/* Content Container */}
              <div className="relative h-full p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cloud size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div className="h-12 w-12 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center">
                        <Cloud className="text-white" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight mb-2">Deploy Cloud</h3>
                        <p className="text-white/60 font-light">One-click deployment via our managed partners. High availability, zero maintenance.</p>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {['AWS', 'GCP', 'DigitalOcean'].map(p => (
                          <div key={p} className="h-8 flex items-center justify-center rounded bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono uppercase">
                            {p}
                          </div>
                        ))}
                     </div>
                     <button 
                        onClick={() => setShowDeployModal(true)}
                        className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-wider hover:text-white transition-colors"
                     >
                        Start Deployment <ArrowRight size={14} />
                     </button>
                  </div>
              </div>
           </div>
        </div>

        {/* 3. MY FACILITATORS DASHBOARD */}
        <div className="mb-24 space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                 <ShieldCheck className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">My Facilitators</h3>
                <p className="text-white/60 font-light text-sm">Manage your Cloud and CLI instances.</p>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {/* Node 1: Cloud */}
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Cloud className="text-blue-400" size={20} />
                       </div>
                       <div>
                          <div className="text-white font-bold font-mono">Cloud-Alpha-1</div>
                          <div className="text-xs text-white/40 font-mono">ID: 0x8a...2b9c</div>
                       </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                       Online
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-xs font-mono text-white/60">
                    <div>
                       <div className="text-white/30 uppercase tracking-wider mb-1">Uptime</div>
                       <div className="text-white">99.9%</div>
                    </div>
                    <div className="text-right">
                       <div className="text-white/30 uppercase tracking-wider mb-1">Earnings</div>
                       <div className="text-green-400">0 FAC</div>
                    </div>
                 </div>
              </div>

              {/* Node 2: CLI */}
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Terminal className="text-purple-400" size={20} />
                       </div>
                       <div>
                          <div className="text-white font-bold font-mono">CLI-Local-Mac</div>
                          <div className="text-xs text-white/40 font-mono">ID: 0x3d...9e1f</div>
                       </div>
                    </div>
                    <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-400 font-mono uppercase tracking-wide flex items-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-yellow-500" />
                       Syncing
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-xs font-mono text-white/60">
                    <div>
                       <div className="text-white/30 uppercase tracking-wider mb-1">Uptime</div>
                       <div className="text-white">98.2%</div>
                    </div>
                    <div className="text-right">
                       <div className="text-white/30 uppercase tracking-wider mb-1">Earnings</div>
                       <div className="text-green-400">0 FAC</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 4. ACTIVE FACILITATORS LIST */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Active Facilitators</h3>
              <Link href="/explorer" className="text-sm font-mono text-white/50 hover:text-white transition-colors flex items-center gap-2">
                 View Full Explorer <ArrowRight size={14} />
              </Link>
           </div>

           {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
              <div className="col-span-4 md:col-span-3">Node Name</div>
              <div className="col-span-4 md:col-span-3">ID</div>
              <div className="col-span-2 hidden md:block text-right">Uptime</div>
              <div className="col-span-2 hidden md:block text-right">Stake</div>
              <div className="col-span-4 md:col-span-2 text-right">Status</div>
           </div>

           {/* Table Rows (Mock Data) */}
           <div className="space-y-2">
             {MOCK_FACILITATORS.map((node) => (
               <div key={node.id} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center">
                  <div className="col-span-4 md:col-span-3 font-medium text-white">{node.name}</div>
                  <div className="col-span-4 md:col-span-3 font-mono text-xs text-white/40 truncate">{node.id}</div>
                  <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">{node.uptime}</div>
                  <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">{node.stake}</div>
                  <div className="col-span-4 md:col-span-2 flex justify-end">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-mono font-bold text-green-400 uppercase tracking-wide">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       Active
                     </span>
                  </div>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* DEPLOY MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => { setShowDeployModal(false); setDeployStep(1); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                 <X size={20} />
              </button>

              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-bold font-mono text-white uppercase tracking-tight">Create Your Facilitator</h2>
                 <p className="text-white/60 font-light">Launch your cloud node in minutes.</p>
              </div>

              {/* STEP 1: NAME & GUIDE */}
              {deployStep === 1 && (
                <>
                  <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                     <h3 className="font-bold text-white font-mono uppercase tracking-tight">How it works:</h3>
                     <ul className="space-y-2 text-sm text-white/60 font-mono">
                        {[
                          "1. Choose a name for your facilitator",
                          "2. Generate a new wallet",
                          "3. Encrypt the private key",
                          "4. Pay 1 USDC registration fee",
                          "5. Start earning fees!"
                        ].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                     </ul>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Facilitator Name</label>
                        <input 
                           type="text" 
                           value={facilitatorName}
                           onChange={(e) => setFacilitatorName(e.target.value)}
                           placeholder="My Facilitator"
                           className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                        />
                        <p className="text-[10px] text-white/30 font-mono">Min 3 characters, max 50</p>
                     </div>

                     <button 
                        disabled={!facilitatorName}
                        onClick={() => setDeployStep(2)}
                        className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                     >
                        Generate Wallet →
                     </button>
                  </div>
                </>
              )}

              {/* STEP 2: KEYS & PASSWORD */}
              {deployStep === 2 && (
                <div className="space-y-6">
                   {/* Info Box */}
                   <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                      <div className="space-y-1">
                         <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Facilitator Name</div>
                         <div className="text-xl font-bold text-white font-mono">{facilitatorName}</div>
                      </div>
                      
                      <div className="space-y-1">
                         <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Wallet Address</div>
                         <div className="bg-black/50 p-3 rounded-lg border border-white/10 font-mono text-xs text-white/80 break-all">
                            0x738E8270ea83b1fDDE8199Fbe423F0297591aCC1
                         </div>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                         <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wide">
                            <ShieldCheck size={16} /> Save Your Private Key!
                         </div>
                         <p className="text-xs text-red-200/60 leading-relaxed">
                            You'll need it to import to MetaMask and fund with AVAX. We do not store this.
                         </p>
                         <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors">
                            Show Private Key
                         </button>
                      </div>
                   </div>

                   {/* Password Form */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <h3 className="font-bold text-white font-mono uppercase tracking-tight">Encrypt with Password</h3>
                         <div className="grid gap-3">
                            <input 
                               type="password" 
                               placeholder="Password (8+ chars, uppercase, lowercase, number)"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                            <input 
                               type="password" 
                               placeholder="Confirm password"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                         </div>
                      </div>

                      <button 
                         onClick={() => setDeployStep(3)}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
                      >
                         Encrypt & Continue →
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 3: REGISTRATION FEE */}
              {deployStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-widest text-white/80">
                         x402 Protocol (ERC-3009)
                      </div>
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Facilitator Registration Fee</h3>
                      <p className="text-white/60 font-light">Register your facilitator on x402:</p>
                   </div>
                   
                   <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <div className="text-5xl font-bold text-white font-mono tracking-tighter">1 USDC</div>
                      <div className="text-xs font-mono text-white/40 uppercase tracking-widest">on avalanche-fuji</div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-black/50 border border-white/10 font-mono text-sm">
                         <span className="text-white/60">Your USDC Balance:</span>
                         <span className="text-white font-bold">1.00 USDC</span>
                      </div>

                      <button 
                         onClick={() => setDeployStep(4)}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
                      >
                         Pay 1 USDC via x402
                      </button>
                      
                      <p className="text-center text-[10px] text-white/20 font-mono uppercase tracking-widest">
                         Using x402 facilitator on avalanche-fuji
                      </p>
                   </div>
                </div>
              )}

              {/* STEP 4: CLAIM WALLET (PAYOUT ADDRESS) */}
              {deployStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Set Payout Address</h3>
                      <p className="text-white/60 font-light">Where should your facilitator fees be sent?</p>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Payment Recipient Address</label>
                         <input 
                            type="text" 
                            value={paymentAddress}
                            onChange={(e) => setPaymentAddress(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors"
                         />
                         <p className="text-[10px] text-white/30 font-mono">Funds claimed will be sent here automatically.</p>
                      </div>

                      <button 
                         onClick={() => setDeployStep(5)}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
                      >
                         Confirm & Launch →
                      </button>
                   </div>
                </div>
              )}

              {/* STEP 5: SUCCESS DASHBOARD */}
              {deployStep === 5 && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                   {/* Success Banner */}
                   <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center space-y-1">
                      <div className="text-green-400 font-bold text-xl font-mono uppercase tracking-tight">Facilitator Created Successfully!</div>
                      <div className="text-white/60 font-mono text-sm">{facilitatorName}</div>
                   </div>

                   {/* Dashboard Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Status</div>
                         <div className="inline-block px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold font-mono uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Active
                         </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Facilitator Wallet</div>
                         <div className="text-xs text-white/80 font-mono truncate">0x738...1aCC1</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">AVAX Balance</div>
                         <div className="text-lg text-white font-mono font-bold">Managed</div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Payments Processed</div>
                         <div className="text-lg text-white font-mono font-bold">0</div>
                      </div>
                   </div>

                   {/* Ready Info */}
                   <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 space-y-2">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wide">
                         <Activity size={16} /> Node Operational
                      </div>
                      <p className="text-xs text-green-200/60 leading-relaxed">
                         Your facilitator is <strong>ACTIVE</strong> and ready to process payments. Gas fees are managed automatically by the platform.
                      </p>
                   </div>

                   {/* Footer Actions */}
                   <div className="flex gap-4">
                      <button 
                         onClick={() => { setShowDeployModal(false); setDeployStep(1); }}
                         className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                         ← Back to Hub
                      </button>
                      <button className="flex-1 py-3 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors">
                         Refresh Status
                      </button>
                   </div>
                   
                   {/* Payout Recipient Info */}
                   <div className="pt-4 border-t border-white/10">
                      <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Payment Recipient Address</div>
                      <div className="text-xs text-white/60 font-mono truncate">{paymentAddress}</div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
         <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
            <Icon size={18} />
         </div>
         <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white font-mono tracking-tighter">
        {value}
      </div>
    </div>
  )
}

const MOCK_FACILITATORS = [
  { name: "Nexus Prime", id: "0x7a...9f2b", uptime: "99.99%", stake: "500K FAC" },
  { name: "Alpha Node", id: "0x3c...1a8d", uptime: "99.95%", stake: "250K FAC" },
  { name: "Quantum Relay", id: "0x9e...4b5c", uptime: "99.90%", stake: "1.2M FAC" },
  { name: "Iron Fortress", id: "0x1d...8e2f", uptime: "99.85%", stake: "750K FAC" },
  { name: "Flux Gateway", id: "0x5b...3c1a", uptime: "99.92%", stake: "100K FAC" },
]
