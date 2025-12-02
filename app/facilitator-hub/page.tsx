'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Wallet } from 'ethers';
import { encryptPrivateKey, validatePasswordStrength } from '@/lib/facilitator-crypto';
import { X402PaymentModal } from '@/components/X402PaymentModal';
import type { PublicFacilitatorInfo } from '@/lib/facilitator-storage';

export default function FacilitatorHub() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<'intro' | 'generate' | 'encrypt' | 'payment' | 'complete'>('intro');

  // Name
  const [facilitatorName, setFacilitatorName] = useState('');

  // Wallet generation
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; privateKey: string } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false);

  // Encryption
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [encryptedKey, setEncryptedKey] = useState('');

  // Payment recipient
  const [paymentRecipient, setPaymentRecipient] = useState('');

  // Payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [registrationTxHash, setRegistrationTxHash] = useState('');
  const [isCreatingFacilitator, setIsCreatingFacilitator] = useState(false);

  // Created facilitator
  const [createdFacilitatorId, setCreatedFacilitatorId] = useState('');

  // My facilitators
  const [myFacilitators, setMyFacilitators] = useState<PublicFacilitatorInfo[]>([]);

  // Load user's facilitators
  useEffect(() => {
    if (isConnected && address) {
      fetchMyFacilitators();
    }
  }, [isConnected, address]);

  const fetchMyFacilitators = async () => {
    try {
      console.log('🔄 Fetching facilitators...');
      const response = await fetch('/api/facilitator/list');
      const data = await response.json();

      if (data.success) {
        // Filter to only show facilitators created by current user
        const mine = data.facilitators.filter((f: PublicFacilitatorInfo) =>
          f.createdBy.toLowerCase() === address?.toLowerCase()
        );

        console.log(`📋 Found ${mine.length} facilitator(s) for current user`);

        // Check balance for ONLY the first facilitator (since user can only have one)
        if (mine.length > 0) {
          try {
            const fac = mine[0]; // Only check the first one
            const balanceResponse = await fetch(`/api/facilitator/balance?address=${fac.facilitatorWallet}`);
            const balanceData = await balanceResponse.json();

            if (balanceData.success) {
              const newStatus = balanceData.isFunded ? 'active' : 'needs_funding';

              // Update status in Redis if it changed
              if (fac.status !== newStatus) {
                try {
                  await fetch('/api/facilitator/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: fac.id,
                      status: newStatus,
                    }),
                  });
                  console.log(`✅ Updated facilitator ${fac.id} status to: ${newStatus}`);
                } catch (error) {
                  console.error('Failed to update status in Redis:', error);
                }
              }

              setMyFacilitators([{
                ...fac,
                gasBalance: balanceData.balance,
                status: newStatus,
              }]);
            } else {
              setMyFacilitators([fac]);
            }
          } catch (error) {
            console.error('Failed to check balance:', error);
            setMyFacilitators([mine[0]]);
          }
        } else {
          setMyFacilitators([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch facilitators:', error);
    }
  };

  const generateWallet = () => {
    if (!facilitatorName || facilitatorName.length < 3) {
      alert('Please enter a facilitator name (min 3 characters)');
      return;
    }

    const wallet = Wallet.createRandom();
    setGeneratedWallet({
      address: wallet.address,
      privateKey: wallet.privateKey,
    });
    setStep('generate');
  };

  const copyPrivateKey = () => {
    if (generatedWallet) {
      navigator.clipboard.writeText(generatedWallet.privateKey);
      setPrivateKeyCopied(true);
      setTimeout(() => setPrivateKeyCopied(false), 2000);
    }
  };

  const handleEncrypt = () => {
    if (!generatedWallet) return;

    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      setPasswordError(validation.message);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const encrypted = encryptPrivateKey(generatedWallet.privateKey, password);
    setEncryptedKey(encrypted);
    setStep('encrypt');
  };

  const proceedToPayment = () => {
    if (!paymentRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid payment recipient address');
      return;
    }
    setStep('payment');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (txHash: string, proof: string) => {
    // Prevent double execution
    if (isCreatingFacilitator) {
      console.log('⚠️  Already creating facilitator, skipping...');
      return;
    }

    // Check if facilitator already exists
    if (myFacilitators.length > 0) {
      console.log('⚠️  Facilitator already exists, skipping creation...');
      setIsPaymentModalOpen(false);
      setStep('complete');
      return;
    }

    setRegistrationTxHash(txHash);
    setIsPaymentModalOpen(false);
    setIsCreatingFacilitator(true);

    try {
      // First, encrypt private key with system master key
      console.log('🔐 Encrypting with system master key...');
      const encryptResponse = await fetch('/api/facilitator/encrypt-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privateKey: generatedWallet?.privateKey,
        }),
      });

      const encryptData = await encryptResponse.json();
      if (!encryptResponse.ok) {
        throw new Error(encryptData.error || 'Failed to encrypt with system key');
      }

      const systemEncryptedKey = encryptData.encrypted;
      console.log('✅ System encryption complete');

      // Now create facilitator with both encrypted versions
      console.log('📝 Creating facilitator...');
      const response = await fetch('/api/facilitator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: facilitatorName,
          encryptedPrivateKey: encryptedKey,
          systemEncryptedKey: systemEncryptedKey,
          facilitatorWallet: generatedWallet?.address,
          paymentRecipient,
          createdBy: address,
          registrationTxHash: txHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register facilitator');
      }

      console.log('✅ Facilitator registered successfully!');
      setCreatedFacilitatorId(data.facilitator.id);

      // Immediately add the facilitator to state (show dashboard right away)
      const newFacilitator: PublicFacilitatorInfo = {
        id: data.facilitator.id,
        name: facilitatorName,
        facilitatorWallet: generatedWallet?.address || '',
        paymentRecipient: paymentRecipient,
        createdBy: address || '',
        status: 'needs_funding', // Initial status
        totalPayments: 0,
        lastUsed: Date.now(), // Timestamp in milliseconds
        gasBalance: '0', // Will be updated by background fetch
      };
      setMyFacilitators([newFacilitator]);

      // Hide loading and show dashboard immediately
      setIsCreatingFacilitator(false);
      setStep('complete');

      // Fetch full facilitator details in background (will update balance)
      fetchMyFacilitators();

      console.log('🎉 Dashboard ready!');
    } catch (error) {
      console.error('❌ Failed to register facilitator:', error);
      setIsCreatingFacilitator(false);
      alert(`Failed to register facilitator: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Facilitator Hub</h1>
              <p className="text-sm text-gray-600">Create and manage your x402 facilitators</p>
            </div>
            <a href="/" className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-all font-bold">
              ← Back Home
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Show full dashboard if facilitator exists, otherwise show full-page creation */}
        {myFacilitators.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Success Header - only show right after creation */}
              {step === 'complete' && (
                <div className="border-4 border-black p-8 bg-black text-white text-center">
                  <h2 className="text-4xl font-bold mb-2">🎉 Facilitator Created Successfully!</h2>
                  <p className="text-lg">{myFacilitators[0].name}</p>
                </div>
              )}

              {/* Dashboard */}
              <div className="border-4 border-black p-6">
                <h3 className="text-2xl font-bold mb-6">Your Facilitator Dashboard</h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Status Card */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">STATUS</h4>
                    <div className={`inline-block px-4 py-2 text-lg font-bold ${
                      myFacilitators[0].status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {myFacilitators[0].status === 'active' ? '✓ ACTIVE' : '⚠️ INACTIVE'}
                    </div>
                  </div>

                  {/* Wallet Card */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">FACILITATOR WALLET</h4>
                    <p className="font-mono text-sm break-all">{myFacilitators[0].facilitatorWallet}</p>
                  </div>

                  {/* AVAX Balance Card */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">AVAX BALANCE</h4>
                    <p className="text-2xl font-bold">
                      {myFacilitators[0].gasBalance ? `${parseFloat(myFacilitators[0].gasBalance).toFixed(4)} AVAX` : '0 AVAX'}
                    </p>
                  </div>

                  {/* Payments Processed Card */}
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">PAYMENTS PROCESSED</h4>
                    <p className="text-2xl font-bold">{myFacilitators[0].totalPayments}</p>
                  </div>
                </div>

                {/* Activation Instructions */}
                {myFacilitators[0].status !== 'active' && (
                  <div className="bg-yellow-50 border-4 border-yellow-500 p-6">
                    <h4 className="text-xl font-bold mb-4">⚠️ Activation Required</h4>
                    <p className="mb-4">Your facilitator is currently <span className="font-bold">INACTIVE</span>. To start processing payments, you need to fund the facilitator wallet with AVAX for gas fees.</p>

                    <div className="space-y-3">
                      <div className="bg-white p-4 border-2 border-yellow-600">
                        <p className="font-bold mb-2">Step 1: Import Private Key to MetaMask</p>
                        <p className="text-sm">Use the private key you saved during setup to import this wallet into MetaMask.</p>
                      </div>

                      <div className="bg-white p-4 border-2 border-yellow-600">
                        <p className="font-bold mb-2">Step 2: Send AVAX to Facilitator Wallet</p>
                        <p className="text-sm mb-2">Send at least <span className="font-bold">0.1 AVAX</span> to:</p>
                        <p className="font-mono text-xs bg-gray-100 p-2 break-all">{myFacilitators[0].facilitatorWallet}</p>
                        <a
                          href="https://core.app/tools/testnet-faucet/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 px-4 py-2 bg-black text-white font-bold hover:bg-gray-800"
                        >
                          Get Testnet AVAX →
                        </a>
                      </div>

                      <div className="bg-white p-4 border-2 border-yellow-600">
                        <p className="font-bold mb-2">Step 3: Wait for Activation</p>
                        <p className="text-sm">Once funded, your facilitator will automatically activate and start processing payments!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Status Message */}
                {myFacilitators[0].status === 'active' && (
                  <div className="bg-green-50 border-4 border-green-500 p-6 text-center">
                    <p className="text-2xl font-bold mb-2">✓ Your Facilitator is Active!</p>
                    <p className="text-lg">Ready to process x402 payments on Avalanche</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep('intro');
                    setFacilitatorName('');
                    setGeneratedWallet(null);
                    setPassword('');
                    setConfirmPassword('');
                    setEncryptedKey('');
                    setPaymentRecipient('');
                  }}
                  className="flex-1 py-4 border-2 border-black font-bold hover:bg-gray-100 transition-all"
                >
                  ← Back to Hub
                </button>
                <button
                  onClick={() => fetchMyFacilitators()}
                  className="flex-1 py-4 bg-black text-white font-bold hover:bg-gray-800 transition-all"
                >
                  🔄 Refresh Status
                </button>
              </div>

              {/* Payment Recipient Info */}
              <div className="border-2 border-black p-4 bg-gray-50">
                <h4 className="font-bold mb-2">Payment Recipient Address:</h4>
                <p className="font-mono text-sm break-all">{myFacilitators[0].paymentRecipient}</p>
                <p className="text-xs text-gray-600 mt-2">All USDC payments will be sent to this address</p>
              </div>
            </motion.div>
          </div>
        ) : (
          // Full-page creation form when no facilitator exists
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Create Your Facilitator</h2>

            {/* Intro */}
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="border-4 border-black p-6">
                  <h3 className="text-xl font-bold mb-4">How it works:</h3>
                  <ol className="space-y-2 text-sm">
                    <li>1. Choose a name for your facilitator</li>
                    <li>2. Generate a new wallet</li>
                    <li>3. Encrypt the private key</li>
                    <li>4. Pay 1 USDC registration fee</li>
                    <li>5. Fund with AVAX for gas</li>
                    <li>6. Start earning fees!</li>
                  </ol>
                </div>

                {!isConnected ? (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-500">
                    <p className="font-bold">⚠️ Connect your wallet first</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold mb-2">Facilitator Name:</label>
                      <input
                        type="text"
                        placeholder="My Facilitator"
                        value={facilitatorName}
                        onChange={(e) => setFacilitatorName(e.target.value)}
                        className="w-full p-3 border-2 border-black"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-600 mt-1">Min 3 characters, max 50</p>
                    </div>

                    <button
                      onClick={generateWallet}
                      disabled={!facilitatorName || facilitatorName.length < 3}
                      className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 transition-all"
                    >
                      Generate Wallet →
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Generate */}
            {step === 'generate' && generatedWallet && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="border-4 border-black p-6">
                  <h3 className="font-bold mb-2">Facilitator Name:</h3>
                  <p className="text-lg mb-4">{facilitatorName}</p>

                  <h3 className="font-bold mb-2">Wallet Address:</h3>
                  <p className="font-mono text-sm bg-gray-100 p-2 break-all mb-4">
                    {generatedWallet.address}
                  </p>

                  <div className="bg-red-50 border-2 border-red-500 p-4">
                    <p className="font-bold mb-2">🔐 SAVE YOUR PRIVATE KEY!</p>
                    <p className="text-sm mb-3">You'll need it to import to MetaMask and fund with AVAX.</p>

                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 mb-2"
                    >
                      {showPrivateKey ? 'Hide' : 'Show'} Private Key
                    </button>

                    {showPrivateKey && (
                      <div>
                        <p className="font-mono text-xs bg-white p-2 break-all mb-2 border">
                          {generatedWallet.privateKey}
                        </p>
                        <button
                          onClick={copyPrivateKey}
                          className="px-4 py-2 bg-white border-2 border-black font-bold"
                        >
                          {privateKeyCopied ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold">Encrypt with Password:</h3>
                  <input
                    type="password"
                    placeholder="Password (8+ chars, uppercase, lowercase, number)"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    className="w-full p-3 border-2 border-black"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                    className="w-full p-3 border-2 border-black"
                  />

                  {passwordError && <p className="text-red-600 font-bold">❌ {passwordError}</p>}

                  <button
                    onClick={handleEncrypt}
                    disabled={!password || !confirmPassword}
                    className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300"
                  >
                    Encrypt & Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Encrypt */}
            {step === 'encrypt' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-green-50 border-2 border-green-500 p-4">
                  <p className="font-bold">✅ Private key encrypted!</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold">Where should payments go?</h3>
                  <p className="text-sm text-gray-600">Enter your wallet address to receive USDC payments.</p>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={paymentRecipient}
                    onChange={(e) => setPaymentRecipient(e.target.value)}
                    className="w-full p-3 border-2 border-black font-mono text-sm"
                  />

                  <button
                    onClick={proceedToPayment}
                    disabled={!paymentRecipient}
                    className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300"
                  >
                    Pay Facilitator Registration Fee (1 USDC) →
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <X402PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Loading Overlay - Show while creating facilitator */}
      {isCreatingFacilitator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-8 max-w-md">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Creating Your Facilitator...</h3>
              <p className="text-gray-600">Please wait, this will only take a moment.</p>
              <div className="mt-4 space-y-2 text-sm text-left">
                <p>✓ Payment verified</p>
                <p>✓ Encrypting keys</p>
                <p className="animate-pulse">⏳ Registering facilitator...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
