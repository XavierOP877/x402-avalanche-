'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BuilderHub() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Verify x402 payment proof
    if (!isConnected) {
      router.push('/');
      return;
    }

    const proof = sessionStorage.getItem('x402-payment-proof');
    const hash = sessionStorage.getItem('x402-tx-hash');

    if (!proof) {
      // No payment proof found - redirect back
      console.warn('No x402 payment proof found');
      setTimeout(() => router.push('/'), 1000);
      return;
    }

    setTxHash(hash || '');

    // Verify payment with backend (with on-chain verification)
    fetch('/api/payment/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentHeader: proof,
        txHash: hash // Include transaction hash for on-chain verification
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          console.log('✅ Payment verified:', data.payment);
          setPaymentVerified(true);
        } else {
          console.error('❌ Payment not verified:', data.error);
          setTimeout(() => router.push('/'), 2000);
        }
      })
      .catch(error => {
        console.error('Payment verification error:', error);
        setTimeout(() => router.push('/'), 2000);
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold cursor-pointer"
            onClick={() => router.push('/')}
          >
            x402
          </motion.h1>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Verifying Status */}
          {verifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-500 text-yellow-900"
            >
              <p className="font-semibold">🔐 Verifying x402 payment proof...</p>
            </motion.div>
          )}

          {/* Verification Failed */}
          {!verifying && !paymentVerified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 bg-red-50 border-2 border-red-500 text-red-900"
            >
              <p className="font-semibold">❌ Payment verification failed. Redirecting...</p>
            </motion.div>
          )}

          {/* Success Badge */}
          {paymentVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block px-4 py-2 bg-black text-white text-sm font-bold mb-6"
            >
              ✓ PAYMENT VERIFIED VIA x402
            </motion.div>
          )}

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            Welcome to
            <br />
            <span className="inline-block border-4 border-black px-4 py-2 mt-2">
              Builder Hub
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mb-12">
            You've successfully paid using the x402 protocol on Avalanche Fuji testnet.
            This exclusive content is now unlocked!
          </p>

          {/* Payment Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-4 border-black p-8 mb-12 bg-white"
          >
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="text-2xl font-bold">1 USDC</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Network</p>
                <p className="text-2xl font-bold">Avalanche Fuji</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Protocol</p>
                <p className="text-2xl font-bold">x402</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Address</p>
                <p className="text-lg font-mono break-all">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                </p>
              </div>
              {txHash && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono break-all text-blue-600 hover:text-blue-800 underline"
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-8">What You Can Build</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <BuilderCard
                icon="🚀"
                title="Pay-Per-Use APIs"
                description="Create APIs that charge per request using x402 protocol"
              />
              <BuilderCard
                icon="🤖"
                title="AI Agent Payments"
                description="Enable AI agents to pay for services autonomously"
              />
              <BuilderCard
                icon="📊"
                title="Data Marketplaces"
                description="Sell data access on a per-query basis"
              />
              <BuilderCard
                icon="🎮"
                title="Gaming Microtransactions"
                description="In-game purchases with instant on-chain settlement"
              />
              <BuilderCard
                icon="📺"
                title="Content Monetization"
                description="Paywall premium content with crypto payments"
              />
              <BuilderCard
                icon="⚡"
                title="Micropayment Services"
                description="Enable sub-dollar payments economically"
              />
            </div>
          </motion.div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="border-2 border-black p-8 bg-gray-50 mb-12"
          >
            <h3 className="text-2xl font-bold mb-4">Quick Start Example</h3>
            <p className="mb-4 text-gray-700">
              Protect your Next.js API route with x402:
            </p>
            <pre className="bg-black text-white p-4 overflow-x-auto text-sm">
{`// app/api/protected/route.ts
export async function GET(request: Request) {
  const paymentProof = request.headers.get('x-payment-proof');

  if (!paymentProof) {
    return new Response('Payment Required', {
      status: 402,
      headers: {
        'x-accept-payment': 'usdc-avalanche-fuji:1.0',
        'x-payment-address': '0xYourAddress',
      }
    });
  }

  return Response.json({ data: 'Premium content!' });
}`}
            </pre>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="border-4 border-black p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://github.com/x402-rs/x402-rs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold"
              >
                📚 x402 Documentation →
              </a>
              <a
                href="https://docs.avax.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold"
              >
                🏔️ Avalanche Docs →
              </a>
              <a
                href="https://core.app/tools/testnet-faucet/?subnet=c&token=c"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold"
              >
                💧 Fuji Testnet Faucet →
              </a>
              <a
                href="https://testnet.snowtrace.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold"
              >
                🔍 Fuji Explorer →
              </a>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Built with x402 protocol on Avalanche Fuji Testnet
          </p>
          <p className="text-xs text-gray-500 mt-2">
            You've unlocked this content by paying with crypto!
          </p>
        </div>
      </footer>
    </div>
  );
}

function BuilderCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="border-2 border-black p-6 bg-white"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </motion.div>
  );
}
