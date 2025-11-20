# x402 Avalanche Payment Demo

A Next.js application demonstrating the x402 payment protocol on Avalanche Fuji testnet. This app showcases seamless on-chain payments using HTTP 402 status codes with USDC on Avalanche.

## Features

- 🎨 **Modern UI** - Clean black & white design with smooth animations
- 💳 **AVAX to USDC Swap** - Integrated swap widget for easy token conversion
- 🔐 **x402 Payments** - Native HTTP payment protocol integration
- ⚡ **Avalanche Fuji** - Fast, low-cost testnet transactions
- 🌈 **Wallet Connect** - Easy wallet connection with RainbowKit
- 🎯 **Payment Gating** - Access control based on on-chain payments

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **Animations**: Framer Motion
- **Blockchain**: Avalanche Fuji Testnet
- **Protocol**: x402 (HTTP 402 Payment Required)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** 18+ installed
2. **Docker** and Docker Compose installed
3. **Avalanche Fuji Testnet** funds:
   - Get AVAX from [Avalanche Faucet](https://core.app/tools/testnet-faucet/?subnet=c&token=c)
   - You'll need AVAX for gas fees and swapping to USDC
4. **WalletConnect Project ID**:
   - Get one free at [WalletConnect Cloud](https://cloud.walletconnect.com/)
5. **MetaMask** or any Web3 wallet

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
cd x402
npm install
\`\`\`

### 2. Configure Environment Variables

#### For Next.js App:

Edit \`.env.local\`:

\`\`\`env
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Facilitator URL (default is localhost)
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:8080

# Your wallet address to receive payments
NEXT_PUBLIC_PAYMENT_RECIPIENT=0xYourWalletAddress
\`\`\`

#### For x402 Facilitator:

Edit \`.env.facilitator\`:

\`\`\`env
HOST=0.0.0.0
PORT=8080
RPC_URL_AVALANCHE_FUJI=https://api.avax-test.network/ext/bc/C/rpc
SIGNER_TYPE=private-key

# IMPORTANT: Replace with your own private key
# This account needs AVAX on Fuji for gas fees
EVM_PRIVATE_KEY=0xYourPrivateKeyHere

RUST_LOG=info
\`\`\`

⚠️ **Security Warning**: Never commit your private keys to version control! The provided key is just an example.

### 3. Start the x402 Facilitator

The facilitator handles payment verification and on-chain settlement:

\`\`\`bash
docker-compose up -d
\`\`\`

Check if it's running:

\`\`\`bash
docker-compose logs -f
\`\`\`

You should see logs indicating the facilitator is listening on port 8080.

### 4. Run the Next.js App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Step 1: Get Testnet Funds

1. Go to [Avalanche Fuji Faucet](https://core.app/tools/testnet-faucet/?subnet=c&token=c)
2. Connect your wallet
3. Request AVAX tokens (you'll get test AVAX)

### Step 2: Add Avalanche Fuji to Your Wallet

- **Network Name**: Avalanche Fuji C-Chain
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Symbol**: AVAX
- **Explorer**: https://testnet.snowtrace.io/

### Step 3: Use the Application

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Swap AVAX to USDC** (if needed):
   - Enter amount of AVAX to swap
   - Click "Swap" button
   - Approve transaction in wallet
   - Wait for confirmation
3. **Launch App**: Click "LAUNCH APP" button
4. **Pay 1 USDC**:
   - Payment modal appears
   - Click "Pay 1 USDC"
   - Approve transaction
5. **Access Builder Hub**: After successful payment, you're redirected to exclusive content

## Project Structure

\`\`\`
x402/
├── app/
│   ├── page.tsx              # Landing page with swap widget
│   ├── layout.tsx            # Root layout with providers
│   ├── globals.css           # Global styles
│   └── builder-hub/
│       └── page.tsx          # Protected content page
├── components/
│   ├── Providers.tsx         # Web3 providers wrapper
│   ├── SwapWidget.tsx        # AVAX to USDC swap interface
│   └── PaymentModal.tsx      # x402 payment modal
├── lib/
│   ├── wagmi.ts             # Wagmi configuration
│   └── contracts.ts         # Contract addresses and ABIs
├── docker-compose.yml       # x402 facilitator setup
├── .env.facilitator        # Facilitator configuration
└── .env.local              # Next.js environment variables
\`\`\`

## Contract Addresses (Avalanche Fuji)

- **USDC**: \`0x5425890298aed601595a70AB815c96711a31Bc65\`
- **WAVAX**: \`0xd00ae08403B9bbb9124bB305C09058E32C39A48c\`
- **Trader Joe Router**: \`0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901\`

## How x402 Protocol Works

1. **Request**: Client requests protected resource
2. **402 Response**: Server returns \`402 Payment Required\` with payment details
3. **Payment**: Client signs and submits payment on-chain
4. **Verification**: Facilitator verifies payment on Avalanche
5. **Access Granted**: Client receives access token to protected resource

## Troubleshooting

### Facilitator not starting?
- Check Docker is running: \`docker ps\`
- Check logs: \`docker-compose logs\`
- Ensure port 8080 is not in use

### Swap failing?
- Ensure you have enough AVAX (need some for gas)
- Check you're on Avalanche Fuji network
- Try a smaller amount first

### Payment not working?
- Ensure you have at least 1 USDC
- Check facilitator is running
- Verify wallet is connected to Fuji
- Check wallet has AVAX for gas fees

### Wallet not connecting?
- Ensure WalletConnect Project ID is set in \`.env.local\`
- Try refreshing the page
- Check browser console for errors

## Development

### Run in development mode:
\`\`\`bash
npm run dev
\`\`\`

### Build for production:
\`\`\`bash
npm run build
npm start
\`\`\`

### Stop facilitator:
\`\`\`bash
docker-compose down
\`\`\`

## Resources

- [x402 Protocol Documentation](https://github.com/x402-rs/x402-rs)
- [Avalanche Documentation](https://docs.avax.network/)
- [Avalanche Fuji Explorer](https://testnet.snowtrace.io/)
- [Fuji Testnet Faucet](https://core.app/tools/testnet-faucet/?subnet=c&token=c)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)

## Important Notes

⚠️ **Testnet Only**: This app uses Avalanche Fuji testnet. Do not use real funds.

⚠️ **Demo Purpose**: This is a demonstration of the x402 protocol. For production use, implement proper security measures, payment verification, and access control.

⚠️ **Private Keys**: Never commit private keys to version control. Always use environment variables.

## License

MIT

## Support

For issues and questions:
- x402 Protocol: [GitHub Issues](https://github.com/x402-rs/x402-rs/issues)
- Avalanche: [Avalanche Discord](https://discord.gg/avalanche)

---

Built with ❤️ using x402 protocol on Avalanche
