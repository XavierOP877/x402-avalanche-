# Quick Start - Get Running in 5 Minutes! 🚀

## Prerequisites
- Node.js 18+ installed ✓
- Docker Desktop running ✓
- MetaMask wallet ✓

## Step 1: Configure WalletConnect (2 minutes)

1. Get a FREE Project ID:
   - Visit: https://cloud.walletconnect.com/
   - Sign up/Login
   - Create new project
   - Copy the **Project ID**

2. Edit `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

## Step 2: Get Test AVAX (1 minute)

1. Go to: https://core.app/tools/testnet-faucet/?subnet=c&token=c
2. Connect MetaMask
3. Select **Fuji (C-Chain)**
4. Request AVAX (you'll get ~2 AVAX instantly!)

## Step 3: Start Everything (1 minute)

```bash
# Terminal 1: Start x402 Facilitator
docker-compose up -d

# Terminal 2: Start Next.js App
npm run dev
```

## Step 4: Test It Out! (1 minute)

1. Open: http://localhost:3000
2. Click "Connect Wallet"
3. Switch to **Avalanche Fuji** network
4. Click "Launch App"
5. Swap 0.1 AVAX → USDC
6. Pay 1 USDC
7. Access Builder Hub! 🎉

## That's It!

You now have a working x402 payment demo on Avalanche!

### What You Built:
- ✅ Full Next.js app with Web3 integration
- ✅ AVAX to USDC swap functionality
- ✅ x402 payment protocol implementation
- ✅ Payment-gated content
- ✅ Beautiful black & white UI with animations

### Next Steps:
- Read `SETUP.md` for detailed information
- Read `README.md` for architecture details
- Customize the UI in `app/page.tsx`
- Add your own protected content in `app/builder-hub/page.tsx`

## Troubleshooting

**"Can't connect wallet"**
→ Make sure you set WalletConnect Project ID in `.env.local`

**"Swap failing"**
→ Get more test AVAX from the faucet

**"Docker not starting"**
→ Make sure Docker Desktop is running

**Need Help?**
- Check `SETUP.md` for detailed troubleshooting
- Check `README.md` for full documentation

---

**Important**: This is on TESTNET (Fuji). All tokens are FREE test tokens. No real money involved!

Enjoy building with x402 on Avalanche! ⛰️
