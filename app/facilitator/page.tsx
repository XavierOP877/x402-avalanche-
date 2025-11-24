'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { formatEther } from 'viem';
import { X402_CONFIG } from '@/lib/x402';

interface UserFacilitatorInfo {
  id: string;
  displayName: string;
  ownerAddress: string;
  facilitatorWalletAddress: string;
  recipientAddress: string;
  network: string;
  status: 'active' | 'inactive' | 'pending';
  totalTransactions: number;
  gasBalance: string;
  lastUsed: number;
  description?: string;
}

type Step = 'wallet' | 'password' | 'fund' | 'recipient' | 'activate';

export default function FacilitatorPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // User's facilitator
  const [facilitator, setFacilitator] = useState<UserFacilitatorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup wizard state
  const [currentStep, setCurrentStep] = useState<Step>('wallet');
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch user's facilitator on mount
  useEffect(() => {
    if (isConnected && address) {
      fetchMyFacilitator();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchMyFacilitator = async () => {
    try {
      const response = await fetch(`/api/facilitator/my?address=${address}`);
      const data = await response.json();

      if (data.success && data.facilitator) {
        setFacilitator(data.facilitator);
      }
    } catch (error) {
      console.error('Failed to fetch facilitator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWallet = () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    setGeneratedPrivateKey(privateKey);
    setPublicAddress(account.address);
    setError('');
  };

  const handleImportWallet = (pk: string) => {
    try {
      // Clean and validate private key
      const cleanPk = pk.startsWith('0x') ? pk : `0x${pk}`;
      const account = privateKeyToAccount(cleanPk as `0x${string}`);

      setGeneratedPrivateKey(cleanPk);
      setPublicAddress(account.address);
      setError('');
    } catch (error) {
      setError('Invalid private key format');
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      setError('Invalid recipient address');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch('/api/facilitator/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: address,
          privateKey: generatedPrivateKey,
          recipientAddress,
          network: X402_CONFIG.NETWORK,
          password,
          displayName: displayName || undefined,
          description: description || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Facilitator registered! Please fund the gas wallet to activate.');
        await fetchMyFacilitator();
      } else {
        setError(data.error || data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Failed to register facilitator');
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleActivate = async () => {
    if (!facilitator) return;

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch('/api/facilitator/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilitatorId: facilitator.id,
          ownerAddress: address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Facilitator activated successfully!');
        await fetchMyFacilitator();
      } else {
        setError(data.error || data.message || 'Activation failed');
      }
    } catch (error) {
      setError('Failed to activate facilitator');
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="border-b-2 border-black p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
              x402
            </h1>
            <ConnectButton />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Connect Wallet</h2>
          <p className="text-xl text-gray-600">Please connect your wallet to manage your facilitator</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
            x402
          </h1>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold mb-4">
            FACILITATOR NODE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Run Your Own Facilitator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Process x402 payments with your own wallet. Earn by facilitating gasless transfers for users.
          </p>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700"
            >
              ❌ {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-100 border-2 border-green-500 text-green-700"
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Card (if facilitator exists) */}
        {facilitator ? (
          <FacilitatorStatusCard
            facilitator={facilitator}
            onActivate={handleActivate}
            isLoading={isRegistering}
          />
        ) : (
          <SetupWizard
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            generatedPrivateKey={generatedPrivateKey}
            publicAddress={publicAddress}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            recipientAddress={recipientAddress}
            setRecipientAddress={setRecipientAddress}
            displayName={displayName}
            setDisplayName={setDisplayName}
            description={description}
            setDescription={setDescription}
            onGenerateWallet={handleGenerateWallet}
            onImportWallet={handleImportWallet}
            onRegister={handleRegister}
            isRegistering={isRegistering}
            connectedAddress={address!}
          />
        )}

        {/* Info Section */}
        <InfoSection />
      </main>
    </div>
  );
}

// Status Card Component
function FacilitatorStatusCard({
  facilitator,
  onActivate,
  isLoading,
}: {
  facilitator: UserFacilitatorInfo;
  onActivate: () => void;
  isLoading: boolean;
}) {
  const statusColor = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-500',
  }[facilitator.status];

  const statusText = {
    active: '✅ ACTIVE',
    pending: '⏳ PENDING',
    inactive: '⏸️ INACTIVE',
  }[facilitator.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-4 border-black p-8 mb-8"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Facilitator</h2>
          <div className={`inline-block px-3 py-1 ${statusColor} text-white text-sm font-bold`}>
            {statusText}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Display Name</p>
          <p className="text-xl font-bold">{facilitator.displayName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Gas Balance</p>
          <p className="text-xl font-bold">{parseFloat(facilitator.gasBalance).toFixed(4)} AVAX</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Gas Wallet</p>
          <p className="text-lg font-mono break-all">
            {facilitator.facilitatorWalletAddress.slice(0, 10)}...{facilitator.facilitatorWalletAddress.slice(-8)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Recipient Address</p>
          <p className="text-lg font-mono break-all">
            {facilitator.recipientAddress.slice(0, 10)}...{facilitator.recipientAddress.slice(-8)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Network</p>
          <p className="text-lg font-bold">{facilitator.network}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Transactions Processed</p>
          <p className="text-lg font-bold">{facilitator.totalTransactions}</p>
        </div>
      </div>

      {facilitator.status === 'pending' && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-500 text-yellow-900">
          <p className="font-semibold mb-2">⚠️ Activation Required</p>
          <p className="text-sm mb-2">
            Send at least <strong>0.1 AVAX</strong> to your gas wallet:
          </p>
          <p className="text-sm font-mono bg-yellow-100 p-2 break-all">
            {facilitator.facilitatorWalletAddress}
          </p>
        </div>
      )}

      {facilitator.status === 'pending' && (
        <button
          onClick={onActivate}
          disabled={isLoading}
          className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300"
        >
          {isLoading ? 'Checking...' : 'Check Balance & Activate'}
        </button>
      )}

      {facilitator.status === 'active' && (
        <div className="p-4 bg-green-50 border-2 border-green-500 text-green-900">
          <p className="font-semibold">✅ Your facilitator is active and ready to process payments!</p>
        </div>
      )}
    </motion.div>
  );
}

// Setup Wizard Component
function SetupWizard({
  currentStep,
  setCurrentStep,
  generatedPrivateKey,
  publicAddress,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  recipientAddress,
  setRecipientAddress,
  displayName,
  setDisplayName,
  description,
  setDescription,
  onGenerateWallet,
  onImportWallet,
  onRegister,
  isRegistering,
  connectedAddress,
}: any) {
  const [importKey, setImportKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  return (
    <div className="border-4 border-black p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6">Setup Your Facilitator</h2>

      {/* Step 1: Wallet Generation */}
      {currentStep === 'wallet' && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Step 1: Generate Gas Wallet</h3>
          <p className="text-gray-600 mb-6">
            Create a new wallet or import an existing one. This wallet will pay gas fees for transactions.
          </p>

          {!generatedPrivateKey ? (
            <div className="space-y-4">
              <button
                onClick={onGenerateWallet}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800"
              >
                🔑 Generate New Wallet
              </button>

              <div className="text-center text-gray-500">OR</div>

              <div>
                <input
                  type="password"
                  placeholder="Paste your private key (with or without 0x)"
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  className="w-full p-3 border-2 border-black mb-2"
                />
                <button
                  onClick={() => onImportWallet(importKey)}
                  className="w-full py-3 bg-gray-800 text-white font-bold hover:bg-gray-700"
                >
                  📥 Import Existing Wallet
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-500 text-red-900">
                <p className="font-bold mb-2">⚠️ SAVE YOUR PRIVATE KEY</p>
                <p className="text-sm mb-3">
                  Save this private key securely. You'll need it to recover your facilitator.
                </p>
                <div className="relative">
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={generatedPrivateKey}
                    readOnly
                    className="w-full p-3 font-mono text-sm bg-white border border-red-300 pr-20"
                  />
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-2 top-2 px-3 py-1 bg-red-500 text-white text-xs font-bold"
                  >
                    {showPrivateKey ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPrivateKey)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white font-bold text-sm"
                >
                  📋 Copy
                </button>
              </div>

              <div className="p-4 bg-gray-100 border-2 border-black">
                <p className="text-sm text-gray-600 mb-1">Public Address (Gas Wallet):</p>
                <p className="font-mono text-sm break-all">{publicAddress}</p>
              </div>

              <button
                onClick={() => setCurrentStep('password')}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800"
              >
                Next: Set Password →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Password */}
      {currentStep === 'password' && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Step 2: Set Encryption Password</h3>
          <p className="text-gray-600 mb-6">
            Create a strong password to encrypt your private key. You'll need this password for future operations.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number"
                className="w-full p-3 border-2 border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full p-3 border-2 border-black"
              />
            </div>

            <button
              onClick={() => setCurrentStep('recipient')}
              disabled={!password || password !== confirmPassword || password.length < 8}
              className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300"
            >
              Next: Set Recipient →
            </button>

            <button
              onClick={() => setCurrentStep('wallet')}
              className="w-full py-2 text-gray-600 hover:text-black"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Recipient Address */}
      {currentStep === 'recipient' && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Step 3: Configure Facilitator</h3>
          <p className="text-gray-600 mb-6">
            Set where you want to receive USDC payments and give your facilitator a name.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Recipient Address (Where USDC goes)</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 border-2 border-black font-mono"
              />
              <button
                onClick={() => setRecipientAddress(connectedAddress)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Use connected wallet address
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Display Name (Optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="My Facilitator"
                className="w-full p-3 border-2 border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fast and reliable facilitator"
                rows={3}
                className="w-full p-3 border-2 border-black"
              />
            </div>

            <button
              onClick={onRegister}
              disabled={!recipientAddress || !recipientAddress.startsWith('0x') || isRegistering}
              className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isRegistering ? 'Registering...' : '🚀 Register Facilitator'}
            </button>

            <button
              onClick={() => setCurrentStep('password')}
              className="w-full py-2 text-gray-600 hover:text-black"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Info Section
function InfoSection() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-12">
      <div className="border-2 border-black p-6">
        <h3 className="text-xl font-bold mb-3">💰 How It Works</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Generate a wallet for paying gas fees</li>
          <li>• Fund it with AVAX (min 0.1 AVAX)</li>
          <li>• Users select your facilitator for payments</li>
          <li>• You process their transactions (they pay USDC, you pay gas)</li>
          <li>• USDC goes directly to your recipient address</li>
        </ul>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-xl font-bold mb-3">⚡ Requirements</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Min 0.1 AVAX</strong> in gas wallet</li>
          <li>• Valid recipient address for USDC</li>
          <li>• Strong encryption password</li>
          <li>• Keep facilitator active for best ranking</li>
        </ul>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-xl font-bold mb-3">🔐 Security</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Private keys encrypted with AES-256-GCM</li>
          <li>• Your password never leaves your browser</li>
          <li>• Keys stored in secure Vercel KV database</li>
          <li>• You control the gas wallet</li>
        </ul>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-xl font-bold mb-3">📊 Economics</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Gas cost: ~$0.01-0.05 per transaction</li>
          <li>• You receive full USDC amount from user</li>
          <li>• No platform fees (currently)</li>
          <li>• Earn reputation by processing more transactions</li>
        </ul>
      </div>
    </div>
  );
}
