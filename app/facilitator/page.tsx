"use client"

import Link from "next/link"
import { ShieldCheck, Server, Activity, Wallet, Clock, ArrowRight, Cloud, X, AlertCircle, Terminal, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ethers } from "ethers"
import { X402PaymentModal } from "@/components/X402PaymentModal"
import VariableProximity from "@/components/ui/VariableProximity"
import { useRef } from "react"

interface Facilitator {
  id: string
  name: string
  facilitatorWallet: string
  paymentRecipient: string
  createdBy: string
  status: 'needs_funding' | 'active' | 'inactive'
  totalPayments: number
  lastUsed: number
  reputation?: number
}


export default function FacilitatorPage() {
  const { address, isConnected } = useAccount()
  const descriptionRef = useRef<HTMLDivElement>(null)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployStep, setDeployStep] = useState(1)
  const [facilitatorName, setFacilitatorName] = useState("")
  const [paymentAddress, setPaymentAddress] = useState("")
  const [facilitators, setFacilitators] = useState<Facilitator[]>([])
  const [myFacilitators, setMyFacilitators] = useState<Facilitator[]>([])
  const [networkStats, setNetworkStats] = useState({
    activeNodes: 0,
    totalStaked: "$0",
    feesGenerated: "$0",
    transactions: 0,
    networkUptime: "0%"
  })
  const [loading, setLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [facilitatorBalances, setFacilitatorBalances] = useState<Record<string, string>>({})

  // Wallet generation states
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; privateKey: string } | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [encryptedKey, setEncryptedKey] = useState("")

  // Created facilitator tracking
  const [createdFacilitatorId, setCreatedFacilitatorId] = useState<string | null>(null)
  const [facilitatorStatus, setFacilitatorStatus] = useState<'needs_funding' | 'active'>('needs_funding')
  const [facilitatorBalance, setFacilitatorBalance] = useState<string>('0')
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // x402 Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isCreatingFacilitator, setIsCreatingFacilitator] = useState(false)
  const [creationInProgress, setCreationInProgress] = useState(false)

  // Set payment address to connected wallet (always use connected wallet as recipient)
  useEffect(() => {
    if (address && !generatedWallet) {
      setPaymentAddress(address)
    }
  }, [address, generatedWallet])

  // Generate a new wallet
  const handleGenerateWallet = () => {
    const wallet = ethers.Wallet.createRandom()
    setGeneratedWallet({
      address: wallet.address,
      privateKey: wallet.privateKey
    })
    // Keep paymentAddress as connected wallet (not the generated wallet)
    setDeployStep(2)
  }

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 8) return false
    if (!/[A-Z]/.test(pwd)) return false // Has uppercase
    if (!/[a-z]/.test(pwd)) return false // Has lowercase
    if (!/[0-9]/.test(pwd)) return false // Has number
    return true
  }

  // Encrypt private key with password
  const handleEncryptKey = async () => {
    if (!generatedWallet) return

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (!validatePassword(password)) {
      alert('Password must be at least 8 characters with uppercase, lowercase, and number')
      return
    }

    try {
      // Simple encryption using AES (for demo purposes)
      // In production, use proper key derivation (PBKDF2, scrypt, etc.)
      const encoder = new TextEncoder()
      const data = encoder.encode(generatedWallet.privateKey)
      const passwordKey = encoder.encode(password.padEnd(32, '0').slice(0, 32))

      const key = await crypto.subtle.importKey(
        'raw',
        passwordKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      // Store IV + encrypted data as base64
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encrypted), iv.length)
      const encryptedB64 = btoa(String.fromCharCode(...combined))

      setEncryptedKey(encryptedB64)
      setDeployStep(3)
    } catch (error) {
      console.error('Encryption failed:', error)
      alert('Failed to encrypt private key')
    }
  }

  // Handle x402 payment success
  const handlePaymentSuccess = async (txHash: string, proof: string) => {
    console.log('✅ x402 Payment successful:', txHash)

    // Prevent duplicate creation
    if (creationInProgress) {
      console.log('⚠️ Creation already in progress, skipping...')
      return
    }

    setShowPaymentModal(false)

    // Automatically create facilitator after successful payment
    await createFacilitatorAfterPayment(txHash)
  }

  // Create facilitator automatically after payment
  const createFacilitatorAfterPayment = async (txHash: string) => {
    // Prevent duplicate creation
    if (creationInProgress) {
      console.log('⚠️ Creation already in progress, skipping...')
      return
    }

    if (!generatedWallet || !facilitatorName || !paymentAddress || !address) {
      alert('Missing required information. Please try again.')
      setDeployStep(1)
      return
    }

    setCreationInProgress(true)
    setIsCreatingFacilitator(true)
    setDeployStep(4) // Show loading step

    try {
      const response = await fetch('/api/facilitator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: facilitatorName,
          encryptedPrivateKey: encryptedKey,          // User's password-encrypted private key (for backup/export)
          privateKey: generatedWallet.privateKey,      // Plain private key (backend will encrypt with SYSTEM_MASTER_KEY)
          facilitatorWallet: generatedWallet.address,  // The generated wallet address
          paymentRecipient: paymentAddress,            // Where fees go (connected wallet)
          createdBy: address,                          // Connected wallet that created it
          registrationTxHash: txHash,                  // x402 payment tx hash
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Save the created facilitator ID and initial status
        setCreatedFacilitatorId(data.facilitator.id)
        setFacilitatorStatus('needs_funding')
        setFacilitatorBalance('0')
        setDeployStep(5) // Go to step 5 (funding status)
        // Don't fetch here - will fetch when modal closes
      } else {
        alert(`Error: ${data.error}`)
        setDeployStep(1)
      }
    } catch (error) {
      console.error('Failed to create facilitator:', error)
      alert('Failed to create facilitator')
      setDeployStep(1)
      setCreationInProgress(false)
    } finally {
      setIsCreatingFacilitator(false)
    }
  }

  // Fetch all facilitators and network stats
  useEffect(() => {
    fetchFacilitators()
  }, [address])

  // Auto-check and activate facilitators that need funding (on page load)
  useEffect(() => {
    // Don't auto-check if modal is open or creating facilitator
    if (showDeployModal || isCreatingFacilitator) {
      return
    }

    if (myFacilitators.length > 0) {
      autoCheckFacilitators()
    }
  }, [myFacilitators.length, showDeployModal, isCreatingFacilitator]) // Only run when count changes to avoid loops

  // Auto-check all facilitators with "needs_funding" status
  const autoCheckFacilitators = async () => {
    const needsFundingFacilitators = myFacilitators.filter(
      (f) => f.status === 'needs_funding'
    )

    if (needsFundingFacilitators.length === 0) {
      return
    }

    console.log(`🔄 Auto-checking ${needsFundingFacilitators.length} facilitator(s) for activation...`)

    // Check each facilitator in parallel
    const checkPromises = needsFundingFacilitators.map(async (facilitator) => {
      try {
        const response = await fetch('/api/facilitator/check-and-activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facilitatorId: facilitator.id }),
        })

        const data = await response.json()

        if (data.success && data.facilitator.status === 'active') {
          console.log(`✅ Auto-activated facilitator: ${facilitator.name} (${data.facilitator.balance} AVAX)`)
          return true
        }
        return false
      } catch (error) {
        console.error(`Failed to auto-check facilitator ${facilitator.id}:`, error)
        return false
      }
    })

    const results = await Promise.all(checkPromises)
    const activatedCount = results.filter((r) => r).length

    // Refresh the list if any were activated
    if (activatedCount > 0) {
      console.log(`✅ Auto-activated ${activatedCount} facilitator(s)`)
      await fetchFacilitators()
    }
  }

  const fetchFacilitators = async () => {
    try {
      // Don't fetch if modal is open or creating facilitator
      if (showDeployModal || isCreatingFacilitator) {
        console.log('⏸️  Skipping fetch - modal is open or creating facilitator')
        return
      }

      setLoading(true)
      const response = await fetch('/api/facilitator/list')
      const data = await response.json()

      if (data.success) {
        const allFacilitators = data.facilitators || []
        setFacilitators(allFacilitators)

        // Filter for user's facilitators if connected
        if (address) {
          const userFacilitators = allFacilitators.filter(
            (f: Facilitator) => f.createdBy?.toLowerCase() === address.toLowerCase()
          )
          setMyFacilitators(userFacilitators)

          // Fetch balances for user's facilitators
          if (userFacilitators.length > 0) {
            fetchFacilitatorBalances(userFacilitators)
          }
        }

        // Calculate network stats
        const activeCount = allFacilitators.filter((f: Facilitator) => f.status === 'active').length
        setNetworkStats({
          activeNodes: activeCount,
          totalStaked: "$0", // Add staking API if available
          feesGenerated: "$0", // Add from payment API
          transactions: 0, // Add transaction count API
          networkUptime: activeCount > 0 ? "99.9%" : "0%"
        })
      }
    } catch (error) {
      console.error('Failed to fetch facilitators:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch real balances for facilitators
  const fetchFacilitatorBalances = async (facilitators: Facilitator[]) => {
    setBalanceLoading(true)
    const balances: Record<string, string> = {}

    try {
      await Promise.all(
        facilitators.map(async (facilitator) => {
          try {
            const response = await fetch(`/api/facilitator/balance?address=${facilitator.facilitatorWallet}`)
            const data = await response.json()

            if (data.success) {
              balances[facilitator.id] = parseFloat(data.balance).toFixed(4)
            }
          } catch (error) {
            console.error(`Failed to fetch balance for ${facilitator.id}:`, error)
            balances[facilitator.id] = '0'
          }
        })
      )

      setFacilitatorBalances(balances)
    } catch (error) {
      console.error('Error fetching balances:', error)
    } finally {
      setBalanceLoading(false)
    }
  }

  // Check balance and activate facilitator
  const handleCheckAndActivate = async () => {
    if (!createdFacilitatorId) {
      alert('No facilitator to check')
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await fetch('/api/facilitator/check-and-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilitatorId: createdFacilitatorId }),
      })

      const data = await response.json()

      if (data.success) {
        setFacilitatorStatus(data.facilitator.status)
        setFacilitatorBalance(data.facilitator.balance)

        if (data.facilitator.status === 'active') {
          alert(`✅ Facilitator activated! Balance: ${data.facilitator.balance} AVAX`)
        } else {
          alert(`⚠️ Not enough AVAX. Current: ${data.facilitator.balance} AVAX, Required: ${data.facilitator.minimumRequired} AVAX`)
        }

        // Refresh facilitator list
        await fetchFacilitators()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to check and activate:', error)
      alert('Failed to check balance')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Delete facilitator
  const handleDeleteFacilitator = async (facilitatorId: string, facilitatorName: string) => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    const confirmed = confirm(`Are you sure you want to delete "${facilitatorName}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch('/api/facilitator/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId,
          userAddress: address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Facilitator "${facilitatorName}" deleted successfully`)
        // Refresh facilitator list after modal closes
        setTimeout(() => fetchFacilitators(), 100)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete facilitator:', error)
      alert('Failed to delete facilitator')
    }
  }


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
          <div ref={descriptionRef} className="max-w-2xl" style={{ cursor: 'text' }}>
            <VariableProximity
              label="The backbone of the autonomous economy. Run a node, earn fees, and secure agent transactions."
              className="text-xl text-white/50 font-light leading-relaxed block"
              fromFontVariationSettings="'wght' 300, 'opsz' 9"
              toFontVariationSettings="'wght' 700, 'opsz' 40"
              containerRef={descriptionRef}
              radius={80}
              falloff="linear"
            />
          </div>
        </div>

        {/* WALLET CONNECTION PROMPT */}
        {!isConnected && (
          <div className="relative mb-12 group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">
                    Connect Your Wallet
                  </h3>
                  <p className="text-white/60 font-light max-w-md">
                    Access the dashboard to deploy facilitators, manage nodes, and track your network earnings.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur transition-opacity group-hover:opacity-40" />
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button 
                                onClick={openConnectModal} 
                                type="button" 
                                className="group relative px-8 py-4 overflow-hidden rounded-xl bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative text-white font-mono font-bold uppercase tracking-wider">
                                  Connect Wallet
                                </span>
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button onClick={openChainModal} type="button" className="relative px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 font-bold font-mono uppercase tracking-wider rounded-xl hover:bg-red-500/20 transition-all">
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', gap: 12 }}>
                              <button
                                onClick={openChainModal}
                                style={{ display: 'flex', alignItems: 'center' }}
                                type="button"
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono hover:bg-white/10 transition-colors"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? 'Chain icon'}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>

                              <button onClick={openAccountModal} type="button" className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white font-mono hover:bg-white/20 transition-colors">
                                {account.displayName}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ''}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        )}

        {/* 1. NETWORK STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-24">
          <StatCard label="Active Nodes" value={loading ? "..." : networkStats.activeNodes.toString()} icon={Server} color="text-blue-500" />
          <StatCard label="Total Staked" value={networkStats.totalStaked} icon={Wallet} color="text-blue-500" />
          <StatCard label="Fees Generated" value={networkStats.feesGenerated} icon={Activity} color="text-blue-500" />
          <StatCard label="Transactions" value={networkStats.transactions.toString()} icon={ArrowRight} color="text-blue-500" />
          <StatCard label="Network Uptime" value={networkStats.networkUptime} icon={Clock} color="text-blue-500" />
        </div>

        {/* 2. MY FACILITATORS DASHBOARD */}
        {isConnected && (
          <div className="mb-24 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Server className="text-primary" size={24} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Deploy Facilitator</h3>
                     <p className="text-white/60 font-light text-sm">Choose your deployment method</p>
                   </div>
                </div>
             </div>

             {/* CREATE OPTIONS */}
             <div className="grid md:grid-cols-2 gap-6 mb-12">
               {/* CLI CARD */}
               <div
                 className="relative group p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all text-left opacity-60 cursor-not-allowed"
               >
                 <div className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white transition-colors">
                   <Terminal size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight mb-2">CLI Node</h3>
                 <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                     Under Development
                   </span>
                 </div>
                 <p className="text-white/40 text-sm font-light max-w-[80%]">
                   Run a self-hosted node via command line. For advanced users.
                 </p>
               </div>

               {/* CLOUD CARD */}
               <button
                 onClick={() => setShowDeployModal(true)}
                 className="relative group p-6 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-blue-500/5 hover:border-blue-400/60 hover:from-blue-500/30 hover:to-blue-500/10 backdrop-blur-md transition-all text-left shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
               >
                 <div className="absolute top-4 right-4 flex gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400 uppercase tracking-wider animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        LIVE
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                        <Cloud size={24} />
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight mb-2">Cloud Node</h3>
                 <div className="flex items-center gap-2 mb-3">
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/20">
                     Recommended
                   </span>
                 </div>
                 <p className="text-blue-100/80 text-sm font-light max-w-[85%]">
                   Deploy a managed facilitator node instantly. No setup required. Start earning rewards immediately.
                 </p>
               </button>
             </div>

             {/* MY FACILITATORS SECTION */}
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                         <ShieldCheck className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">My Facilitators</h3>
                        <p className="text-white/60 font-light text-sm">Manage your facilitator instances</p>
                      </div>
                   </div>
                </div>

             {loading ? (
               <div className="text-center py-12 text-white/40">Loading...</div>
             ) : myFacilitators.length > 0 ? (
               <>
                 {/* Aggregate Stats Dashboard */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border border-primary/20 bg-primary/5">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white font-mono mb-1">
                       {myFacilitators.length}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Total Facilitators</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-green-400 font-mono mb-1">
                       {myFacilitators.filter(f => f.status === 'active').length}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Active</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
                       {myFacilitators.reduce((sum, f) => sum + (f.totalPayments || 0), 0)}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Total Payments</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-purple-400 font-mono mb-1">
                       {myFacilitators.length > 0
                         ? (myFacilitators.reduce((sum, f) => sum + (f.reputation || 0), 0) / myFacilitators.length).toFixed(1)
                         : '0'}
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Avg Reputation</div>
                   </div>
                 </div>

                 {/* Individual Facilitators */}
                 <div className="grid md:grid-cols-2 gap-6">
                  {myFacilitators.map((facilitator) => (
                    <div key={facilitator.id} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Cloud className="text-blue-400" size={20} />
                             </div>
                             <div>
                                <div className="text-white font-bold font-mono">{facilitator.name}</div>
                                <div className="text-xs text-white/40 font-mono">ID: {facilitator.id.slice(0, 8)}...</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide flex items-center gap-1.5 ${
                               facilitator.status === 'active'
                                 ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                 : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                             }`}>
                                <div className={`w-1 h-1 rounded-full ${facilitator.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                {facilitator.status}
                             </div>
                             <button
                                onClick={() => handleDeleteFacilitator(facilitator.id, facilitator.name)}
                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete facilitator"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-xs font-mono text-white/60">
                          <div>
                             <div className="text-white/30 uppercase tracking-wider mb-1">Balance</div>
                             <div className="text-white">
                               {balanceLoading ? 'Loading...' : (facilitatorBalances[facilitator.id] || '0')} AVAX
                             </div>
                          </div>
                          <div className="text-center">
                             <div className="text-white/30 uppercase tracking-wider mb-1">Payments</div>
                             <div className="text-blue-400">{facilitator.totalPayments || 0}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-white/30 uppercase tracking-wider mb-1">Reputation</div>
                             <div className="text-green-400">{facilitator.reputation || 0}/5</div>
                          </div>
                       </div>
                    </div>
                  ))}
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-white/10 bg-white/5 text-center space-y-6">
                 <div className="space-y-2">
                   <p className="text-white/60 text-lg">You don't have any facilitators yet.</p>
                   <p className="text-sm text-white/40">Deploy a node to start earning rewards.</p>
                 </div>
                 
                 <button
                   onClick={() => setShowDeployModal(true)}
                   className="group relative px-8 py-3 overflow-hidden rounded-xl bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <span className="relative flex items-center gap-2 text-white font-mono font-bold uppercase tracking-wider">
                     <Cloud size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                     Deploy Facilitator
                   </span>
                 </button>
               </div>
             )}
          </div>
          </div>
        )}

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
              <div className="col-span-2 hidden md:block text-right">Payments</div>
              <div className="col-span-2 hidden md:block text-right">Balance</div>
              <div className="col-span-4 md:col-span-2 text-right">Status</div>
           </div>

           {/* Table Rows (Real Data - Only Active) */}
           <div className="space-y-2">
             {loading ? (
               <div className="text-center py-12 text-white/40">Loading facilitators...</div>
             ) : facilitators.filter(f => f.status === 'active').length > 0 ? (
               facilitators.filter(f => f.status === 'active').map((node) => (
                 <div key={node.id} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center">
                    <div className="col-span-4 md:col-span-3 font-medium text-white">{node.name}</div>
                    <div className="col-span-4 md:col-span-3 font-mono text-xs text-white/40 truncate">{node.id}</div>
                    <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">{node.totalPayments || 0}</div>
                    <div className="col-span-2 hidden md:block text-right text-sm text-white/60 font-mono">N/A</div>
                    <div className="col-span-4 md:col-span-2 flex justify-end">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${
                         node.status === 'active'
                           ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                           : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                         {node.status}
                       </span>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 text-white/40">No facilitators found. Be the first to create one!</div>
             )}
           </div>
        </div>

      </div>

      {/* DEPLOY MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
           <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
              <div className="max-h-[85vh] overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <button
                  onClick={() => {
                    // Don't allow closing during creation
                    if (isCreatingFacilitator) return;
                    setShowDeployModal(false);
                    setDeployStep(1);
                    // Reset all states
                    setFacilitatorName("");
                    setGeneratedWallet(null);
                    setPassword("");
                    setConfirmPassword("");
                    setEncryptedKey("");
                    setShowPrivateKey(false);
                    setCreationInProgress(false);
                    // Refresh facilitator list after closing
                    setTimeout(() => fetchFacilitators(), 100);
                  }}
                  disabled={isCreatingFacilitator}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
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
                        disabled={!facilitatorName || facilitatorName.length < 3}
                        onClick={handleGenerateWallet}
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
                            {generatedWallet?.address || 'Generating...'}
                         </div>
                      </div>

                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                         <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wide">
                            <ShieldCheck size={16} /> Save Your Private Key!
                         </div>
                         <p className="text-xs text-red-200/60 leading-relaxed">
                            You'll need it to import to MetaMask and fund with AVAX. We do not store this.
                         </p>
                         {showPrivateKey && generatedWallet && (
                           <div className="bg-black/70 p-3 rounded-lg border border-red-500/30 font-mono text-xs text-red-200 break-all select-all">
                             {generatedWallet.privateKey}
                           </div>
                         )}
                         <button
                           onClick={() => setShowPrivateKey(!showPrivateKey)}
                           className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                         >
                            {showPrivateKey ? 'Hide Private Key' : 'Show Private Key'}
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
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               placeholder="Password (8+ chars, uppercase, lowercase, number)"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                            <input
                               type="password"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="Confirm password"
                               className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
                            />
                         </div>
                         {password && !validatePassword(password) && (
                           <p className="text-xs text-red-400 font-mono">Password must have 8+ chars, uppercase, lowercase, and number</p>
                         )}
                         {password && confirmPassword && password !== confirmPassword && (
                           <p className="text-xs text-red-400 font-mono">Passwords do not match</p>
                         )}
                      </div>

                      <button
                         onClick={handleEncryptKey}
                         disabled={!password || !confirmPassword || password !== confirmPassword || !validatePassword(password)}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                      <button
                         onClick={() => setShowPaymentModal(true)}
                         disabled={!isConnected}
                         className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Pay 1 USDC via x402 (Gasless)
                      </button>

                      <p className="text-center text-[10px] text-white/20 font-mono uppercase tracking-widest">
                         Using x402 facilitator on avalanche-fuji
                      </p>
                   </div>
                </div>
              )}

              {/* STEP 4: CREATING FACILITATOR */}
              {deployStep === 4 && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                   <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mx-auto mb-4">
                         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-white font-mono uppercase tracking-tight">Creating Facilitator...</h3>
                      <p className="text-white/60 font-light">Please wait while we set up your facilitator node</p>
                   </div>

                   <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center gap-3 text-white/60">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-sm font-mono">✓ Payment verified</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/60">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                         <span className="text-sm font-mono">⏳ Encrypting private key...</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/60">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                         <span className="text-sm font-mono">⏳ Storing facilitator data...</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/60">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                         <span className="text-sm font-mono">⏳ Registering on-chain...</span>
                      </div>
                   </div>
                </div>
              )}

              {/* STEP 5: FUNDING & ACTIVATION */}
              {deployStep === 5 && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                   {/* Success Banner */}
                   <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center space-y-1">
                      <div className="text-green-400 font-bold text-xl font-mono uppercase tracking-tight">Facilitator Created Successfully!</div>
                      <div className="text-white/60 font-mono text-sm">{facilitatorName}</div>
                   </div>

                   {/* Status Display */}
                   <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Current Status</div>
                            {facilitatorStatus === 'active' ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                 Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold font-mono uppercase">
                                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                 Needs Funding
                              </div>
                            )}
                         </div>
                         <div className="space-y-1">
                            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">AVAX Balance</div>
                            <div className="text-lg text-white font-mono font-bold">{facilitatorBalance} AVAX</div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Facilitator Wallet Address</div>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white font-mono text-xs break-all">
                               {generatedWallet?.address || 'N/A'}
                            </div>
                            <button
                               onClick={() => {
                                 navigator.clipboard.writeText(generatedWallet?.address || '')
                                 alert('Address copied to clipboard!')
                               }}
                               className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-white text-xs font-mono transition-colors"
                            >
                               Copy
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Funding Instructions */}
                   {facilitatorStatus === 'needs_funding' ? (
                     <div className="p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wide">
                           <AlertCircle size={16} /> Action Required: Fund Your Facilitator
                        </div>
                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                           Your facilitator needs <strong>at least 0.1 AVAX</strong> to pay for gas fees when processing payments.
                        </p>
                        <div className="space-y-2">
                           <div className="text-[10px] text-yellow-200/60 font-mono uppercase tracking-widest">Steps:</div>
                           <ol className="text-xs text-yellow-200/80 space-y-1 list-decimal list-inside">
                              <li>Copy the facilitator wallet address above</li>
                              <li>Send at least 0.1 AVAX to this address from your wallet or <a href="https://faucet.avax.network/" target="_blank" className="text-yellow-400 underline">get testnet AVAX from faucet</a></li>
                              <li>Click "Check Balance & Activate" below</li>
                              <li>Once activated, return to the hub to see your active facilitator</li>
                           </ol>
                        </div>
                     </div>
                   ) : (
                     <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5 space-y-2">
                        <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wide">
                           <Activity size={16} /> Facilitator Activated!
                        </div>
                        <p className="text-xs text-green-200/60 leading-relaxed">
                           Your facilitator is <strong>ACTIVE</strong> and ready to process payments. It will automatically handle gas fees for transactions.
                        </p>
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex gap-4">
                      <button
                         onClick={async () => {
                           setShowDeployModal(false)
                           setDeployStep(1)
                           setCreatedFacilitatorId(null)
                           setFacilitatorStatus('needs_funding')
                           setFacilitatorBalance('0')
                           // Reset all form states
                           setFacilitatorName("")
                           setGeneratedWallet(null)
                           setPassword("")
                           setConfirmPassword("")
                           setEncryptedKey("")
                           setShowPrivateKey(false)
                           setCreationInProgress(false)
                           // Refresh facilitator list after closing
                           setTimeout(() => fetchFacilitators(), 100)
                         }}
                         className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                         ← Back to Hub
                      </button>
                      <button
                         onClick={handleCheckAndActivate}
                         disabled={isCheckingStatus || facilitatorStatus === 'active'}
                         className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isCheckingStatus ? 'Checking...' : facilitatorStatus === 'active' ? '✓ Activated' : 'Check Balance & Activate'}
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
        </div>
      )}

      {/* X402 PAYMENT MODAL */}
      <X402PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="group relative p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(100,100,255,0.1)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
           <div className={`p-2 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={18} />
           </div>
           <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-3xl font-bold text-white font-mono tracking-tighter shadow-glow">
          {value}
        </div>
      </div>
    </div>
  )
}

