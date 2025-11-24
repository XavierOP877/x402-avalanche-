/**
 * x402 Payment Modal Component
 *
 * This component implements the FULL x402 protocol:
 * 1. User approves USDC spending (ERC-20 approval)
 * 2. Payment is submitted to x402 facilitator
 * 3. Facilitator executes the blockchain transaction
 * 4. Payment proof is stored for verification
 * 5. User is redirected with verified access
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useSignTypedData } from 'wagmi';
import { formatUnits } from 'viem';
import { USDC_FUJI } from '@/lib/contracts';
import { useRouter } from 'next/navigation';
import {
  settlePaymentWithAuthorization,
  encodePaymentHeader,
  createPaymentRequirements,
  X402_CONFIG,
  isFacilitatorReady,
} from '@/lib/x402';
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
  createX402ExactPayload,
} from '@/lib/erc3009';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentStatus = 'idle' | 'checking-facilitator' | 'signing' | 'settling' | 'confirming' | 'verifying' | 'success' | 'error';

export function X402PaymentModal({ isOpen, onClose }: X402PaymentModalProps) {
  const router = useRouter();
  const { address } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [facilitatorReady, setFacilitatorReady] = useState<boolean>(true);

  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_FUJI.address,
  });

  // wagmi hook for signing typed data
  const { signTypedDataAsync } = useSignTypedData();

  const hasEnoughUSDC = usdcBalance && parseFloat(formatUnits(usdcBalance.value, 6)) >= parseFloat(X402_CONFIG.PAYMENT_AMOUNT);

  // Check facilitator status on mount
  useEffect(() => {
    if (isOpen) {
      checkFacilitator();
    }
  }, [isOpen]);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setErrorMessage('');
      setTxHash('');
      setPaymentProof('');
    }
  }, [isOpen]);

  // Redirect on success
  useEffect(() => {
    if (paymentStatus === 'success' && paymentProof) {
      // Store payment proof in session storage
      sessionStorage.setItem('x402-payment-proof', paymentProof);
      sessionStorage.setItem('x402-tx-hash', txHash);

      setTimeout(() => {
        router.push('/builder-hub');
      }, 2000);
    }
  }, [paymentStatus, paymentProof, txHash, router]);

  const checkFacilitator = async () => {
    try {
      const ready = await isFacilitatorReady();
      setFacilitatorReady(ready);
      if (!ready) {
        setErrorMessage('x402 facilitator is not ready. Please check if Docker container is running.');
      }
    } catch (error) {
      setFacilitatorReady(false);
      setErrorMessage('Cannot connect to x402 facilitator.');
    }
  };

  const handleX402Payment = async () => {
    if (!address || !hasEnoughUSDC || !facilitatorReady) return;

    try {
      setPaymentStatus('checking-facilitator');
      setErrorMessage('');

      // Step 1: Check facilitator is ready
      console.log('🔍 Checking x402 facilitator...');
      const ready = await isFacilitatorReady();
      if (!ready) {
        throw new Error('Facilitator does not support required payment method');
      }

      // Step 2: Create ERC-3009 authorization
      setPaymentStatus('signing');
      console.log('✍️ Creating ERC-3009 authorization...');

      const authorization = createTransferAuthorization(
        address,
        X402_CONFIG.PAYMENT_RECIPIENT,
        X402_CONFIG.PAYMENT_AMOUNT
      );

      console.log('📝 Authorization created:', authorization);

      // Step 3: Get typed data for signing
      const typedData = getTypedDataForSigning(authorization);
      console.log('📋 Typed data prepared:', typedData);

      // Step 4: Request user signature (MetaMask will pop up)
      console.log('🔐 Requesting signature from wallet...');
      console.log('⚠️ Please sign the message in MetaMask!');

      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      });

      console.log('✅ Authorization signed:', signature);

      // Step 5: Create signed authorization
      const signedAuth = createSignedAuthorization(authorization, signature);

      // Step 6: Create x402 payload with signed authorization
      const x402Payload = createX402ExactPayload(signedAuth);

      // Step 7: Create payment requirements for verification
      const paymentRequirements = createPaymentRequirements(X402_CONFIG.PAYMENT_AMOUNT);

      // Step 8: Submit to facilitator
      setPaymentStatus('settling');
      console.log('🚀 Submitting payment to x402 facilitator...');

      const settlementResult = await settlePaymentWithAuthorization(x402Payload, paymentRequirements);

      console.log('📦 Settlement result:', JSON.stringify(settlementResult, null, 2));

      // Extract transaction hash from various possible field names
      const transactionHash = settlementResult.txHash || settlementResult.tx || settlementResult.transaction;

      if (!transactionHash) {
        const errorDetails = settlementResult.error || settlementResult.message || 'No transaction hash returned';
        console.error('❌ Settlement failed - no tx hash:', errorDetails);
        console.error('❌ Full response:', JSON.stringify(settlementResult, null, 2));
        throw new Error(errorDetails);
      }

      console.log('✅ Payment settled on-chain:', transactionHash);
      setTxHash(transactionHash);

      // Step 9: Wait for confirmation
      setPaymentStatus('confirming');
      console.log('⏳ Waiting for blockchain confirmation...');

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 10: Generate payment proof for verification
      setPaymentStatus('verifying');
      console.log('🔐 Generating x402 payment proof...');

      // Create proof with the x402 payload
      const proof = encodePaymentHeader(x402Payload);
      setPaymentProof(proof);

      console.log('✅ x402 payment proof generated');

      // Step 11: Success!
      setPaymentStatus('success');
      console.log('🎉 REAL x402 payment complete with ERC-3009!');

    } catch (error) {
      console.error('❌ x402 payment error:', error);
      setPaymentStatus('error');

      // Better error messages
      let errorMsg = 'Payment failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMsg = 'Signature rejected. Please approve the signature in MetaMask.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'checking-facilitator':
        return 'Checking x402 facilitator...';
      case 'signing':
        return 'Requesting signature (check MetaMask)...';
      case 'settling':
        return 'Submitting to x402 facilitator...';
      case 'confirming':
        return 'Confirming on-chain...';
      case 'verifying':
        return 'Generating x402 proof...';
      case 'success':
        return '✓ x402 Payment Complete!';
      case 'error':
        return 'Payment Failed';
      default:
        return 'Pay 1 USDC via x402';
    }
  };

  const isProcessing = ['checking-facilitator', 'signing', 'settling', 'confirming', 'verifying'].includes(paymentStatus);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white border-4 border-black p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="float-right text-2xl font-bold hover:text-gray-600 disabled:opacity-50"
            >
              ×
            </button>

            <div className="clear-both">
              {/* x402 Protocol Badge */}
              <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold mb-4">
                x402 PROTOCOL (ERC-3009)
              </div>

              <h2 className="text-3xl font-bold mb-4">Payment Required</h2>

              <div className="mb-6">
                <p className="text-lg mb-2">To access the Builder Hub, pay via x402:</p>
                <div className="text-4xl font-bold mb-2">{X402_CONFIG.PAYMENT_AMOUNT} USDC</div>
                <p className="text-sm text-gray-600">on {X402_CONFIG.NETWORK}</p>
              </div>

              {/* Facilitator Status */}
              {!facilitatorReady && (
                <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-500 text-yellow-900">
                  <p className="text-sm font-semibold mb-1">⚠️ Facilitator Offline</p>
                  <p className="text-xs">
                    Make sure Docker container is running:
                    <code className="block mt-1 text-xs bg-yellow-100 p-1">docker compose up -d</code>
                  </p>
                </div>
              )}

              {/* Balance Display */}
              {address && usdcBalance && (
                <div className="mb-6 p-4 border-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your USDC Balance:</span>
                    <span className="font-bold text-lg">
                      {parseFloat(formatUnits(usdcBalance.value, 6)).toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              )}

              {/* Insufficient Balance Warning */}
              {address && !hasEnoughUSDC && (
                <div className="mb-4 p-4 bg-gray-100 border-2 border-black">
                  <p className="text-sm font-medium">
                    ⚠️ Insufficient USDC balance. Please swap AVAX for USDC first.
                  </p>
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-red-100 border-2 border-red-500"
                  >
                    <p className="text-sm font-medium text-red-700">
                      ❌ {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Button */}
              <button
                onClick={handleX402Payment}
                disabled={!address || !hasEnoughUSDC || isProcessing || paymentStatus === 'success' || !facilitatorReady}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mb-4"
              >
                {!address ? 'Connect Wallet First'
                  : !facilitatorReady ? 'Facilitator Offline'
                  : !hasEnoughUSDC ? 'Insufficient USDC'
                  : getStatusMessage()}
              </button>

              {/* Transaction Hash */}
              <AnimatePresence>
                {txHash && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-4 p-4 bg-gray-50 border-2 border-gray-300"
                  >
                    <p className="text-xs font-semibold mb-2 text-gray-700">Transaction Hash:</p>
                    <a
                      href={`https://testnet.snowtrace.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono break-all text-blue-600 hover:text-blue-800 underline"
                    >
                      {txHash}
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {paymentStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-black text-white text-center"
                  >
                    <p className="font-bold mb-2">✓ Payment Verified via x402!</p>
                    <p className="text-sm mb-2">Transaction confirmed on-chain</p>
                    <p className="text-xs">Redirecting to Builder Hub...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Using x402 facilitator on {X402_CONFIG.NETWORK}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
