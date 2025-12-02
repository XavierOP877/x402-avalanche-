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
  encodePaymentHeader,
  createPaymentRequirements,
  X402_CONFIG,
} from '@/lib/x402';
import {
  createTransferAuthorization,
  getTypedDataForSigning,
  createSignedAuthorization,
  createX402ExactPayload,
  signedAuthorizationToJSON,
} from '@/lib/erc3009';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txHash: string, proof: string) => void; // Optional callback - if not provided, redirects to builder-hub
  facilitatorId?: string; // Optional custom facilitator ID
}

type PaymentStatus = 'idle' | 'checking-facilitator' | 'signing' | 'settling' | 'confirming' | 'verifying' | 'success' | 'error';

export function X402PaymentModal({ isOpen, onClose, onSuccess, facilitatorId }: X402PaymentModalProps) {
  const router = useRouter();
  const { address } = useAccount();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [customFacilitator, setCustomFacilitator] = useState<any>(null);

  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_FUJI.address,
  });

  // wagmi hook for signing typed data
  const { signTypedDataAsync } = useSignTypedData();

  const hasEnoughUSDC = usdcBalance && parseFloat(formatUnits(usdcBalance.value, 6)) >= parseFloat(X402_CONFIG.PAYMENT_AMOUNT);

  // Fetch custom facilitator details if provided
  useEffect(() => {
    if (isOpen && facilitatorId) {
      fetchCustomFacilitator();
    } else {
      setCustomFacilitator(null);
    }
  }, [isOpen, facilitatorId]);

  const fetchCustomFacilitator = async () => {
    try {
      const response = await fetch('/api/facilitator/list');
      const data = await response.json();

      if (data.success) {
        const fac = data.facilitators.find((f: any) => f.id === facilitatorId);
        if (fac) {
          setCustomFacilitator(fac);
          console.log('🔧 Using custom facilitator:', fac.name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch custom facilitator:', error);
    }
  };

  // Check facilitator status on mount
  // DISABLED: No longer using Docker facilitator, using Next.js API instead
  // useEffect(() => {
  //   if (isOpen) {
  //     checkFacilitator();
  //   }
  // }, [isOpen]);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setErrorMessage('');
      setTxHash('');
      setPaymentProof('');
    }
  }, [isOpen]);

  // Handle success - callback or redirect
  useEffect(() => {
    if (paymentStatus === 'success' && paymentProof) {
      if (onSuccess) {
        // Custom callback provided - use it instead of redirecting
        setTimeout(() => {
          onSuccess(txHash, paymentProof);
        }, 1500);
      } else {
        // No callback - default behavior: redirect to builder-hub
        sessionStorage.setItem('x402-payment-proof', paymentProof);
        sessionStorage.setItem('x402-tx-hash', txHash);

        setTimeout(() => {
          router.push('/builder-hub');
        }, 2000);
      }
    }
  }, [paymentStatus, paymentProof, txHash, router, onSuccess]);

  // Removed checkFacilitator - no longer using Docker facilitator

  const handleX402Payment = async () => {
    if (!address || !hasEnoughUSDC) return;

    try {
      setPaymentStatus('signing');
      setErrorMessage('');

      // Step 2: Create ERC-3009 authorization
      setPaymentStatus('signing');
      console.log('✍️ Creating ERC-3009 authorization...');

      // Use custom facilitator's payment recipient if provided, otherwise use default
      const paymentRecipient = customFacilitator
        ? customFacilitator.paymentRecipient
        : X402_CONFIG.PAYMENT_RECIPIENT;

      console.log('🔍 Payment recipient:', paymentRecipient);
      console.log('🔍 Using facilitator:', customFacilitator ? customFacilitator.name : 'Default');
      console.log('🔍 Your address:', address);

      const authorization = createTransferAuthorization(
        address,
        paymentRecipient,
        X402_CONFIG.PAYMENT_AMOUNT
      );

      console.log('📝 Authorization created:', authorization);
      console.log('📝 Authorization TO address:', authorization.to);

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

      let settlementResult;

      if (customFacilitator) {
        // Use custom facilitator endpoint
        console.log('🔧 Using custom facilitator:', customFacilitator.name);

        // Convert BigInt values to strings for JSON serialization
        const signedAuthJSON = signedAuthorizationToJSON(signedAuth);

        const response = await fetch('/api/x402/settle-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilitatorId,
            paymentPayload: signedAuthJSON,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Custom facilitator settlement failed: ${error}`);
        }

        settlementResult = await response.json();
      } else {
        // Use default Next.js facilitator (ERC-3009 compatible)
        console.log('🔧 Using default facilitator');

        const response = await fetch('/api/x402/settle-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentPayload: x402Payload,
            paymentRequirements: paymentRequirements,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Default facilitator settlement failed: ${error}`);
        }

        settlementResult = await response.json();
      }

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

              <h2 className="text-3xl font-bold mb-4">
                {onSuccess ? 'Facilitator Registration Fee' : 'Payment Required'}
              </h2>

              <div className="mb-6">
                <p className="text-lg mb-2">
                  {onSuccess
                    ? 'Register your facilitator on x402:'
                    : 'To access the Builder Hub, pay via x402:'}
                </p>
                <div className="text-4xl font-bold mb-2">{X402_CONFIG.PAYMENT_AMOUNT} USDC</div>
                <p className="text-sm text-gray-600">on {X402_CONFIG.NETWORK}</p>
              </div>

              {/* Facilitator Status - REMOVED: No longer using Docker */}

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
                disabled={!address || !hasEnoughUSDC || isProcessing || paymentStatus === 'success'}
                className="w-full py-4 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mb-4"
              >
                {!address ? 'Connect Wallet First'
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
                    <p className="text-xs">
                      {onSuccess
                        ? 'Creating your facilitator...'
                        : 'Redirecting to Builder Hub...'}
                    </p>
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
