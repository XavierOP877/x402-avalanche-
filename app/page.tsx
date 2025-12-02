'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { SwapWidget } from '@/components/SwapWidget';
import { X402PaymentModal } from '@/components/X402PaymentModal';
import { USDC_FUJI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import type { PublicFacilitatorInfo } from '@/lib/facilitator-storage';

export default function Home() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [facilitators, setFacilitators] = useState<PublicFacilitatorInfo[]>([]);
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState<string>('default');
  const { address, isConnected } = useAccount();

  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_FUJI.address,
  });

  const hasEnoughUSDC = usdcBalance && parseFloat(formatUnits(usdcBalance.value, 6)) >= 1;

  // Fetch available facilitators
  useEffect(() => {
    fetchFacilitators();
  }, []);

  const fetchFacilitators = async () => {
    try {
      const response = await fetch('/api/facilitator/list');
      const data = await response.json();

      if (data.success) {
        console.log('📋 All facilitators:', data.facilitators.map((f: PublicFacilitatorInfo) => ({
          id: f.id,
          name: f.name,
          status: f.status,
        })));

        // ONLY show active facilitators in dropdown (exclude paused, needs_funding, inactive)
        const activeFacilitators = data.facilitators.filter(
          (f: PublicFacilitatorInfo) => f.status === 'active'
        );

        setFacilitators(activeFacilitators);
        console.log(`✅ Found ${activeFacilitators.length} active facilitators`);
        console.log('✅ Active facilitators:', activeFacilitators.map((f: PublicFacilitatorInfo) => ({
          id: f.id,
          name: f.name,
          status: f.status,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch facilitators:', error);
    }
  };

  const handleLaunchApp = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!hasEnoughUSDC) {
      setShowSwap(true);
      return;
    }

    // Log selected facilitator
    if (selectedFacilitatorId === 'default') {
      console.log('💰 Using default facilitator for payment');
    } else {
      const selectedFac = facilitators.find(f => f.id === selectedFacilitatorId);
      console.log('💰 Using custom facilitator:', selectedFac?.name, selectedFacilitatorId);
    }

    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-xl">x4</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">x402</h1>
                  <p className="text-xs text-gray-500">Payment Protocol</p>
                </div>
              </div>

              <div className="hidden md:flex space-x-8">
                <a href="#features" className="text-sm font-medium hover:text-gray-600 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium hover:text-gray-600 transition-colors">
                  How It Works
                </a>
                <a href="#why-avalanche" className="text-sm font-medium hover:text-gray-600 transition-colors">
                  Why Avalanche
                </a>
                <a href="/facilitator-hub" className="text-sm font-medium hover:text-gray-600 transition-colors">
                  Create Facilitator
                </a>
                <a href="https://github.com/x402-rs/x402-rs" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-gray-600 transition-colors">
                  Docs
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block px-3 py-1.5 bg-black text-white text-xs font-medium">
                FUJI TESTNET
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-bold mb-8"
            >
              <span>⚡</span>
              <span>Powered by Avalanche C-Chain</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              HTTP Payments,
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10">On-Chain.</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-2 left-0 h-4 bg-black/10 -z-0"
                />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first HTTP-native payment protocol for the blockchain era.
              Pay for APIs, content, and services with{' '}
              <span className="font-bold text-black">crypto as seamlessly as HTTP requests.</span>
            </p>

            {/* Facilitator Selection */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 max-w-md mx-auto"
              >
                <label className="block text-sm font-bold mb-2 text-left">
                  Select Facilitator:
                </label>
                <select
                  value={selectedFacilitatorId}
                  onChange={(e) => setSelectedFacilitatorId(e.target.value)}
                  className="w-full p-3 border-2 border-black text-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="default">Default Facilitator (Recommended)</option>
                  {facilitators.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.totalPayments} payments processed)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2 text-left">
                  Choose which facilitator processes your payment.
                  {facilitators.length === 0 && " No custom facilitators available yet."}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunchApp}
                className="px-10 py-5 bg-black text-white text-lg font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Launch Demo App →
              </motion.button>
              <a
                href="https://github.com/x402-rs/x402-rs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 border-2 border-black text-black text-lg font-bold hover:bg-black hover:text-white transition-all w-full sm:w-auto"
              >
                View Documentation
              </a>
            </div>

            {isConnected && !hasEnoughUSDC && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500"
              >
                💡 Need USDC? Swap below to get started
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-100 rounded-full -z-10 blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-100 rounded-full -z-10 blur-3xl opacity-50" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 border-y border-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Built for the Modern Web</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              x402 brings blockchain payments to the HTTP layer, making crypto transactions as simple as API calls.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🌐"
              title="HTTP Native"
              description="Uses the standard 402 Payment Required status code. No custom protocols or SDKs required. Works with any HTTP client."
            />
            <FeatureCard
              icon="⚡"
              title="Instant Settlement"
              description="Payments settle on Avalanche in under 2 seconds. Sub-second finality means no waiting for confirmations."
            />
            <FeatureCard
              icon="🔐"
              title="Cryptographically Secure"
              description="All payments are cryptographically signed and verified on-chain. Your keys, your payments, complete transparency."
            />
            <FeatureCard
              icon="💰"
              title="Micropayment Ready"
              description="Avalanche's low fees make sub-dollar payments economical. Pay for exactly what you use, nothing more."
            />
            <FeatureCard
              icon="🛠️"
              title="Developer Friendly"
              description="Simple API integration with any web framework. Built with Rust for performance and reliability."
            />
            <FeatureCard
              icon="🤖"
              title="AI Agent Ready"
              description="Enable autonomous agents to pay for services on-demand. Perfect for AI-driven workflows and automation."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">How x402 Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to enable payment-gated content and services
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              step="01"
              title="Request"
              description="Client requests a protected resource from your API or service"
              icon="📡"
            />
            <StepCard
              step="02"
              title="402 Response"
              description="Server returns HTTP 402 with payment requirements in headers"
              icon="💳"
            />
            <StepCard
              step="03"
              title="Pay"
              description="Client signs payment with wallet and submits to Avalanche"
              icon="✍️"
            />
            <StepCard
              step="04"
              title="Access Granted"
              description="Payment verified on-chain, client receives requested content"
              icon="✅"
            />
          </div>
        </div>
      </section>

      {/* Swap Widget Section */}
      {showSwap && isConnected && (
        <section className="py-20 bg-gray-50 border-y border-black">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">Get USDC First</h2>
              <p className="text-lg text-gray-600">
                Swap your AVAX for USDC to continue with the payment demo
              </p>
            </motion.div>

            <SwapWidget />

            <div className="text-center mt-8">
              <button
                onClick={() => hasEnoughUSDC && setIsPaymentModalOpen(true)}
                disabled={!hasEnoughUSDC}
                className="px-10 py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {hasEnoughUSDC ? 'Continue to Payment →' : 'Swap AVAX to USDC First'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why Avalanche */}
      <section id="why-avalanche" className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Why Avalanche?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on Avalanche C-Chain for unparalleled speed, low costs, and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold mb-4">⚡ Sub-Second Finality</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Avalanche confirms transactions in under 2 seconds. No waiting for 6 confirmations
                or 15-second block times. Users get instant feedback and immediate access.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold mb-4">💸 Fraction-of-a-Cent Fees</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Transaction fees on Avalanche are typically under $0.01. This makes micropayments
                viable - charge $0.10 for an API call without losing it all to gas fees.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold mb-4">🌍 EVM Compatible</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Avalanche C-Chain is fully EVM compatible. Use familiar tools like MetaMask,
                Ethers.js, and Hardhat. No new languages or frameworks to learn.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold mb-4">🔒 Battle-Tested Security</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Secured by thousands of validators in the Avalanche consensus protocol.
                Billions in TVL protected with zero major security incidents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to Try x402?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Connect your wallet, swap for USDC, and experience the future of web payments
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLaunchApp}
            className="px-12 py-6 bg-black text-white text-xl font-bold hover:bg-gray-800 transition-all shadow-xl"
          >
            Launch Demo App →
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white flex items-center justify-center">
                  <span className="text-black font-bold text-xl">x4</span>
                </div>
                <span className="text-2xl font-bold">x402</span>
              </div>
              <p className="text-gray-400 text-sm">
                HTTP-native payment protocol for the blockchain era. Built on Avalanche.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#why-avalanche" className="hover:text-white transition-colors">Why Avalanche</a></li>
                <li><a href="/builder-hub" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/x402-rs/x402-rs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/x402-rs/x402-rs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://docs.avax.network/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Avalanche Docs</a></li>
                <li><a href="https://testnet.snowtrace.io/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Fuji Explorer</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/x402-rs/x402-rs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://twitter.com/avalancheavax" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://discord.gg/avalanche" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="https://core.app/tools/testnet-faucet/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Fuji Faucet</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2025 x402 Protocol. Demo built on Avalanche Fuji Testnet.
            </p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>Powered by Avalanche</span>
              <span>•</span>
              <span>Built with x402-rs</span>
            </div>
          </div>
        </div>
      </footer>

      {/* x402 Payment Modal */}
      <X402PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        facilitatorId={selectedFacilitatorId === 'default' ? undefined : selectedFacilitatorId}
      />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-2 border-black p-8 hover:shadow-xl transition-shadow"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white font-bold text-2xl mb-4">
          {step}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
