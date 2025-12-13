import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';

// WalletConnect Project ID - Required for wallet connection
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1215cdb3a1c747715f4b6cfc181e2d6f';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local');
}

export const config = getDefaultConfig({
  appName: 'x402 - Distributed Facilitator Network',
  projectId,
  chains: [avalancheFuji],
  ssr: true,
});
