# 🚀 PRODUCTION DEPLOYMENT GUIDE

Complete step-by-step guide to deploy your x402 project to production.

---

## 📋 PREREQUISITES

### Required Accounts (All Free to Start)
1. **GitHub Account** - For code repository
2. **Railway Account** - For facilitator hosting ($5 free credit)
3. **Vercel Account** - For Next.js hosting (Free tier)
4. **WalletConnect Account** - For wallet connection (Free)

### Required Tools
```bash
# Install Node.js (v18 or higher)
node --version  # Should show v18.x or higher

# Install Git
git --version

# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI  
npm install -g vercel
```

---

## 🎯 DEPLOYMENT OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  USER → Vercel (Next.js) → Railway (Facilitator)       │
│                    ↓              ↓                     │
│                  Browser      Avalanche                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## PART 1: PREPARE YOUR PROJECT

### Step 1: Initialize Git Repository

```bash
# Navigate to your project
cd /Users/abhishektripathi/Desktop/x402

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - x402 payment protocol"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `x402-avalanche-payment`
3. Description: `x402 payment protocol implementation on Avalanche`
4. Choose: **Private** (recommended for production)
5. Click **Create repository**

### Step 3: Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/x402-avalanche-payment.git

# Push code
git branch -M main
git push -u origin main
```

---

## PART 2: DEPLOY FACILITATOR TO RAILWAY

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Click **Start a New Project**
3. Sign up with GitHub (recommended)
4. Get **$5 free credit** (enough for 1 month)

### Step 2: Create New Project

```bash
# Login to Railway CLI
railway login

# Link to your project directory
cd /Users/abhishektripathi/Desktop/x402
railway init
```

Choose: **Deploy from GitHub repo**
Select: Your `x402-avalanche-payment` repository

### Step 3: Configure Environment Variables

In Railway Dashboard (https://railway.app/project/YOUR_PROJECT):

1. Click your service
2. Go to **Variables** tab
3. Add these variables:

```env
# === REQUIRED VARIABLES ===

# RPC URL for Avalanche Fuji
RPC_URL_AVALANCHE_FUJI=https://api.avax-test.network/ext/bc/C/rpc

# Facilitator wallet private key (NEW wallet for production!)
EVM_PRIVATE_KEY=your_facilitator_private_key_here

# Signer type
SIGNER_TYPE=private-key

# Server configuration
HOST=0.0.0.0
PORT=8080

# Logging
RUST_LOG=info
```

⚠️ **IMPORTANT**: 
- Use a **NEW wallet** for the facilitator (not your personal wallet)
- This wallet needs **AVAX for gas fees** (~0.5 AVAX should last weeks)
- Get test AVAX from: https://core.app/tools/testnet-faucet/

### Step 4: Deploy Facilitator

```bash
# Deploy from CLI
railway up

# Or let Railway auto-deploy from GitHub
# (Railway will deploy automatically on every git push)
```

### Step 5: Get Facilitator URL

1. In Railway dashboard, go to **Settings**
2. Click **Generate Domain**
3. Copy the URL (e.g., `https://x402-facilitator-production.up.railway.app`)
4. **Save this URL** - you'll need it for Vercel!

### Step 6: Test Facilitator

```bash
# Test the /supported endpoint
curl https://your-facilitator.railway.app/supported

# Should return:
# {"kinds":[{"network":"avalanche-fuji","scheme":"exact","x402Version":1}]}
```

✅ **Facilitator is now live!**

---

## PART 3: DEPLOY FRONTEND TO VERCEL

### Step 1: Prepare Environment Variables

Create a file with your production values:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_FACILITATOR_URL=https://your-facilitator.railway.app
NEXT_PUBLIC_PAYMENT_RECIPIENT=0x9c1e7f1652be26b68355b447a76295df7ba94285
NEXT_PUBLIC_PAYMENT_AMOUNT=1
NEXT_PUBLIC_NETWORK=avalanche-fuji
NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65

# Server-side variable (same as NEXT_PUBLIC_FACILITATOR_URL)
FACILITATOR_URL=https://your-facilitator.railway.app
```

### Step 2: Deploy to Vercel (Method A: Dashboard - Recommended)

1. Go to https://vercel.com/
2. Click **Add New** → **Project**
3. Import your GitHub repository `x402-avalanche-payment`
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (leave as is)
6. Click **Environment Variables**
7. Add ALL variables from Step 1 above:
   - Click **Add** for each variable
   - Name: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - Value: Your actual value
   - Environment: Check **Production**, **Preview**, **Development**
8. Click **Deploy**

### Step 2 Alternative: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# Enter value when prompted

vercel env add NEXT_PUBLIC_FACILITATOR_URL
# Enter: https://your-facilitator.railway.app

vercel env add NEXT_PUBLIC_PAYMENT_RECIPIENT
# Enter: 0x9c1e7f1652be26b68355b447a76295df7ba94285

vercel env add NEXT_PUBLIC_PAYMENT_AMOUNT
# Enter: 1

vercel env add NEXT_PUBLIC_NETWORK
# Enter: avalanche-fuji

vercel env add NEXT_PUBLIC_USDC_ADDRESS
# Enter: 0x5425890298aed601595a70AB815c96711a31Bc65

vercel env add FACILITATOR_URL
# Enter: https://your-facilitator.railway.app

# Deploy to production
vercel --prod
```

### Step 3: Get Your Production URL

After deployment completes, Vercel will give you a URL like:
`https://x402-avalanche-payment.vercel.app`

✅ **Frontend is now live!**

---

## PART 4: VERIFICATION & TESTING

### Test the Complete Flow

1. **Open your Vercel URL** in browser
2. **Connect Wallet** (Avalanche Fuji testnet)
3. **Get Test USDC**:
   - Go to https://core.app/tools/testnet-faucet/
   - Get test AVAX
   - Swap AVAX → USDC
4. **Click "Launch Demo App"**
5. **Pay 1 USDC**
6. **Sign MetaMask message**
7. **Verify transaction** on Snowtrace

### Verification Checklist

- [ ] Website loads on Vercel URL
- [ ] Wallet connection works
- [ ] Payment modal opens
- [ ] MetaMask signature prompt appears
- [ ] Transaction completes successfully
- [ ] USDC sent to correct recipient
- [ ] Builder Hub access granted
- [ ] Transaction visible on Snowtrace

---

## 📊 ENVIRONMENT VARIABLES SUMMARY

### VERCEL (Next.js Frontend)

| Variable | Example | Required | Where to Get |
|----------|---------|----------|--------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `1215cdb3a1c7...` | ✅ Yes | https://cloud.walletconnect.com/ |
| `NEXT_PUBLIC_FACILITATOR_URL` | `https://your.railway.app` | ✅ Yes | Your Railway deployment URL |
| `NEXT_PUBLIC_PAYMENT_RECIPIENT` | `0x9c1e7f1652be26b6...` | ✅ Yes | YOUR wallet address |
| `NEXT_PUBLIC_PAYMENT_AMOUNT` | `1` | No | Default: 1 USDC |
| `NEXT_PUBLIC_NETWORK` | `avalanche-fuji` | No | Default: avalanche-fuji |
| `NEXT_PUBLIC_USDC_ADDRESS` | `0x5425890298aed60...` | No | Default: Fuji USDC |
| `FACILITATOR_URL` | `https://your.railway.app` | ✅ Yes | Same as NEXT_PUBLIC_FACILITATOR_URL |

### RAILWAY (Facilitator Backend)

| Variable | Example | Required | Purpose |
|----------|---------|----------|---------|
| `EVM_PRIVATE_KEY` | `86e88f38688ff3e9...` | ✅ Yes | Facilitator wallet (pays gas) |
| `RPC_URL_AVALANCHE_FUJI` | `https://api.avax-test...` | ✅ Yes | Avalanche RPC endpoint |
| `SIGNER_TYPE` | `private-key` | ✅ Yes | How facilitator signs txs |
| `HOST` | `0.0.0.0` | ✅ Yes | Server host |
| `PORT` | `8080` | ✅ Yes | Server port |
| `RUST_LOG` | `info` | No | Logging level |

---

## 🔒 SECURITY BEST PRACTICES

### For Production Deployment:

1. **Never commit .env files** ✅ (Already in .gitignore)
2. **Use separate wallets**:
   - Facilitator wallet (only for gas)
   - Recipient wallet (receives payments)
   - Personal wallet (for testing)
3. **Secure private keys**:
   - Railway/Vercel encrypt environment variables
   - Never share or log private keys
   - Rotate keys periodically
4. **Monitor facilitator wallet**:
   - Keep ~0.5 AVAX for gas
   - Set up alerts when balance is low
5. **Enable 2FA** on:
   - GitHub
   - Railway
   - Vercel

---

## 💰 COST BREAKDOWN

### Monthly Costs (Testnet/Staging):

| Service | Cost | What It Covers |
|---------|------|----------------|
| **Railway** | $5/month | Facilitator hosting (after $5 credit) |
| **Vercel** | Free | Frontend hosting (Hobby plan) |
| **WalletConnect** | Free | Wallet connection API |
| **Avalanche Fuji RPC** | Free | Testnet blockchain access |
| **TOTAL** | **~$5/month** | Complete stack |

### Production (Mainnet) Costs:

- Railway: $5-20/month (depending on usage)
- Vercel: Free or $20/month (Pro plan for team features)
- Paid RPC: $50-200/month (Alchemy/Infura/QuickNode)
- Gas Fees: Variable (depends on transaction volume)
- **TOTAL**: ~$55-240/month

---

## 🆘 TROUBLESHOOTING

### Issue: "Facilitator not ready"

**Solution**:
1. Check Railway deployment status
2. Verify environment variables are set
3. Check facilitator logs: `railway logs`
4. Ensure facilitator wallet has AVAX for gas

### Issue: "Payment verification failed"

**Solution**:
1. Check Vercel environment variables
2. Verify `FACILITATOR_URL` is correct (no trailing slash)
3. Check browser console for errors
4. Verify network is Avalanche Fuji

### Issue: "Transaction failed"

**Solution**:
1. Ensure user has USDC balance
2. Check facilitator has AVAX for gas
3. Verify USDC contract address is correct
4. Check transaction on Snowtrace for details

### Issue: "CORS error"

**Solution**:
1. Frontend should use `/api/x402/*` endpoints (not direct facilitator URL)
2. Check API routes are deployed to Vercel
3. Verify `FACILITATOR_URL` in Vercel env vars

---

## 📞 SUPPORT & RESOURCES

### Documentation:
- **x402 Protocol**: https://github.com/x402-rs/x402-rs
- **Avalanche Docs**: https://docs.avax.network/
- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

### Tools:
- **Avalanche Fuji Faucet**: https://core.app/tools/testnet-faucet/
- **Snowtrace Testnet**: https://testnet.snowtrace.io/
- **WalletConnect Cloud**: https://cloud.walletconnect.com/

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Both services deployed and running
- [ ] All environment variables configured
- [ ] Facilitator wallet funded with AVAX
- [ ] Test transaction completed successfully
- [ ] Correct recipient receives USDC
- [ ] Transaction verified on Snowtrace
- [ ] Domain configured (optional)
- [ ] Monitoring set up (optional)
- [ ] Documentation updated with URLs

---

## 🎉 SUCCESS!

Your x402 payment protocol is now live in production!

- **Frontend**: https://your-app.vercel.app
- **Facilitator**: https://your-facilitator.railway.app
- **Network**: Avalanche Fuji Testnet

**Next Steps:**
1. Share your demo with others
2. Monitor transaction volume
3. Add custom domain (optional)
4. Implement rate limiting
5. Add analytics
6. Prepare for mainnet deployment

---

**Questions or Issues?**
- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- x402 Protocol: https://github.com/x402-rs/x402-rs/issues

