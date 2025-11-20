# Quick Setup Guide

Follow these steps to get your x402 Avalanche demo app running in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] MetaMask or Web3 wallet installed
- [ ] Git installed (optional)

## Step 1: Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up or log in
3. Create a new project
4. Copy the **Project ID**

## Step 2: Configure Environment Variables

### Edit `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=paste_your_project_id_here
NEXT_PUBLIC_PAYMENT_RECIPIENT=your_wallet_address_here
```

Replace:
- `paste_your_project_id_here` with your WalletConnect Project ID
- `your_wallet_address_here` with your wallet address (where you want to receive payments)

### Edit `.env.facilitator`:

For the facilitator, you need a private key with AVAX on Fuji for gas fees.

**Option A - Use a Test Private Key (Recommended for Testing):**

The default key is already set in `.env.facilitator`. You'll need to fund it:

1. Import this private key to MetaMask (Create a NEW test wallet, don't use your main wallet):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
2. Address will be: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. Get test AVAX from faucet (see Step 3)

**Option B - Use Your Own Private Key:**

1. Create a NEW wallet (never use your main wallet!)
2. Export the private key from MetaMask
3. Replace the `EVM_PRIVATE_KEY` in `.env.facilitator`
4. Get test AVAX for this address

## Step 3: Get Testnet AVAX

1. Go to https://core.app/tools/testnet-faucet/?subnet=c&token=c
2. Connect your wallet
3. Select **Fuji (C-Chain)**
4. Request AVAX tokens
5. Also get AVAX for the facilitator address (if using test key, send to `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)

You'll receive test AVAX in a few seconds!

## Step 4: Add Avalanche Fuji to MetaMask

### Automatic (Recommended):
1. Visit https://chainlist.org/
2. Search for "Avalanche Fuji"
3. Click "Add to MetaMask"

### Manual:
Add network with these details:
- **Network Name**: Avalanche Fuji C-Chain
- **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Chain ID**: `43113`
- **Currency Symbol**: `AVAX`
- **Block Explorer**: `https://testnet.snowtrace.io/`

## Step 5: Start the x402 Facilitator

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

You should see `x402-facilitator` with status `Up`.

## Step 6: Start the Next.js App

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 7: Test the Payment Flow

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your wallet (MetaMask)
   - Approve connection
   - Switch to Avalanche Fuji network if prompted

2. **Swap AVAX to USDC**
   - Click "Launch App" button
   - Swap widget will appear (if you don't have USDC)
   - Enter amount (try 0.1 AVAX)
   - Click "Swap"
   - Approve transaction in MetaMask
   - Wait for confirmation (~2 seconds)

3. **Make Payment**
   - After swap, click "Launch App" again
   - Payment modal opens showing "Pay 1 USDC"
   - Click "Pay 1 USDC"
   - Approve USDC transfer in MetaMask
   - Wait for confirmation

4. **Access Builder Hub**
   - Automatically redirected after successful payment
   - Explore the exclusive content!

## Troubleshooting

### "Docker not running"
Start Docker Desktop application

### "Insufficient funds"
Get more test AVAX from the faucet

### "Swap failed"
- Make sure you have enough AVAX for gas fees
- Try a smaller swap amount
- Check you're on Fuji network

### "Payment failed"
- Ensure you have at least 1 USDC
- Check facilitator is running: `docker-compose ps`
- Verify you have AVAX for gas

### "Wallet won't connect"
- Make sure WalletConnect Project ID is set in `.env.local`
- Restart the app: `Ctrl+C` then `npm run dev`
- Clear browser cache

### Check facilitator logs:
```bash
docker-compose logs -f x402-facilitator
```

## Useful Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Docker
```bash
docker-compose up -d              # Start facilitator
docker-compose down               # Stop facilitator
docker-compose logs -f            # View logs
docker-compose restart            # Restart facilitator
```

### Reset everything
```bash
docker-compose down
rm -rf .next node_modules
npm install
docker-compose up -d
npm run dev
```

## Next Steps

After getting it working:

1. **Customize the UI**
   - Edit `app/page.tsx` for landing page
   - Modify colors in `app/globals.css`
   - Adjust animations in components

2. **Change Payment Amount**
   - Update `PAYMENT_AMOUNT` in `components/PaymentModal.tsx`
   - Update the displayed amount in `app/page.tsx`

3. **Add Your Own Content**
   - Customize `app/builder-hub/page.tsx`
   - Add protected API routes in `app/api/`

4. **Deploy**
   - Deploy Next.js to Vercel/Netlify
   - Deploy facilitator to a cloud server
   - Update environment variables

## Support Resources

- **x402 Docs**: https://github.com/x402-rs/x402-rs
- **Avalanche Docs**: https://docs.avax.network/
- **Fuji Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://core.app/tools/testnet-faucet/

## Common Addresses (Fuji Testnet)

- **USDC**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **WAVAX**: `0xd00ae08403B9bbb9124bB305C09058E32C39A48c`
- **Trader Joe Router**: `0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901`

---

🎉 **That's it!** You now have a working x402 payment demo on Avalanche!

Need help? Check the README.md for more detailed information.
