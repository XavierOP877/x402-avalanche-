# ✅ DEPLOYMENT CHECKLIST

Quick reference for deploying x402 to production.

---

## 🎯 RAILWAY IS FREE: $5 credit for new accounts = 1 month free hosting!

---

## PRE-DEPLOYMENT

- [ ] Code pushed to GitHub
- [ ] All .env files in .gitignore
- [ ] No hard-coded addresses in code
- [ ] Dockerfile exists
- [ ] railway.json exists
- [ ] vercel.json exists
- [ ] .env.example exists

---

## RAILWAY SETUP (Facilitator Backend)

### Account & Project
- [ ] Create Railway account (get $5 free credit)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Create new project from GitHub repo

### Environment Variables to Add
```
Required in Railway Dashboard → Variables:

✅ EVM_PRIVATE_KEY=your_facilitator_private_key
✅ RPC_URL_AVALANCHE_FUJI=https://api.avax-test.network/ext/bc/C/rpc
✅ SIGNER_TYPE=private-key
✅ HOST=0.0.0.0
✅ PORT=8080
✅ RUST_LOG=info
```

### After Deployment
- [ ] Generate domain in Railway
- [ ] Copy facilitator URL (e.g., `https://x402-xxx.railway.app`)
- [ ] Test endpoint: `curl https://your-url.railway.app/supported`
- [ ] Fund facilitator wallet with 0.5 AVAX (for gas)

---

## VERCEL SETUP (Next.js Frontend)

### Account & Project
- [ ] Create Vercel account (free)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Import GitHub repository

### Environment Variables to Add
```
Required in Vercel Dashboard → Settings → Environment Variables:

Frontend Variables (NEXT_PUBLIC_*):
✅ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=get_from_walletconnect.com
✅ NEXT_PUBLIC_FACILITATOR_URL=https://your-facilitator.railway.app
✅ NEXT_PUBLIC_PAYMENT_RECIPIENT=0x9c1e7f1652be26b68355b447a76295df7ba94285
✅ NEXT_PUBLIC_PAYMENT_AMOUNT=1
✅ NEXT_PUBLIC_NETWORK=avalanche-fuji
✅ NEXT_PUBLIC_USDC_ADDRESS=0x5425890298aed601595a70AB815c96711a31Bc65

Server Variable:
✅ FACILITATOR_URL=https://your-facilitator.railway.app
```

### Where to Get Values:
- **WALLETCONNECT_PROJECT_ID**: https://cloud.walletconnect.com/ (free)
- **FACILITATOR_URL**: Your Railway deployment URL
- **PAYMENT_RECIPIENT**: YOUR wallet address to receive payments

### After Deployment
- [ ] Copy Vercel URL (e.g., `https://x402-xxx.vercel.app`)
- [ ] Test website loads
- [ ] Test wallet connection works

---

## TESTING

### Setup
- [ ] Add Avalanche Fuji testnet to MetaMask
- [ ] Get test AVAX from https://core.app/tools/testnet-faucet/
- [ ] Swap AVAX → USDC (need 1+ USDC)

### Flow Test
1. [ ] Open Vercel URL in browser
2. [ ] Click "Connect Wallet"
3. [ ] Select MetaMask
4. [ ] Verify connected to Avalanche Fuji
5. [ ] Click "Launch Demo App"
6. [ ] Click "Pay 1 USDC via x402"
7. [ ] Sign message in MetaMask
8. [ ] Wait for transaction confirmation
9. [ ] Verify redirected to Builder Hub
10. [ ] Check transaction on Snowtrace
11. [ ] Verify USDC received at recipient address

---

## VERIFICATION

### Check Facilitator
```bash
# Should return supported payment methods
curl https://your-facilitator.railway.app/supported

# Expected response:
{"kinds":[{"network":"avalanche-fuji","scheme":"exact","x402Version":1}]}
```

### Check Frontend
- [ ] No console errors
- [ ] Wallet connects successfully
- [ ] Payment modal displays correct amount
- [ ] MetaMask signature request appears
- [ ] Transaction hash displayed
- [ ] Redirect works after payment

### Check Transaction
- [ ] View on Snowtrace: https://testnet.snowtrace.io/tx/YOUR_TX_HASH
- [ ] Function: `transferWithAuthorization` (ERC-3009)
- [ ] From: Your wallet address
- [ ] To: Recipient address (0x9c1e7f1652be26b68355b447a76295df7ba94285)
- [ ] Amount: 1 USDC
- [ ] Status: Success

---

## POST-DEPLOYMENT

### Monitoring
- [ ] Check Railway logs: `railway logs`
- [ ] Monitor facilitator wallet balance
- [ ] Set up alerts for low balance
- [ ] Monitor transaction success rate

### Security
- [ ] Enable 2FA on GitHub
- [ ] Enable 2FA on Railway
- [ ] Enable 2FA on Vercel
- [ ] Rotate facilitator private key periodically
- [ ] Never commit .env files

### Documentation
- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Add troubleshooting section
- [ ] Document deployment process

---

## COSTS

### Railway (Facilitator)
- ✅ **$5 FREE CREDIT** for new accounts
- Then **$5/month** for Hobby plan
- Covers facilitator hosting

### Vercel (Frontend)
- ✅ **FREE** (Hobby plan)
- Unlimited bandwidth
- Auto-scaling

### Other
- ✅ **FREE**: WalletConnect, Avalanche Fuji RPC
- **$0.01-0.05**: Gas per transaction (paid by facilitator)

**TOTAL**: ~$5/month after free credit

---

## QUICK DEPLOY COMMANDS

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Deploy Facilitator (Railway)
railway login
railway init
railway up
# Add environment variables in Railway dashboard
# Generate domain

# 3. Deploy Frontend (Vercel)
vercel login
vercel
# Add environment variables when prompted
vercel --prod

# Done! ✅
```

---

## TROUBLESHOOTING QUICK FIXES

| Issue | Fix |
|-------|-----|
| Facilitator offline | Check Railway logs, restart service |
| CORS errors | Use `/api/x402/*` not direct facilitator URL |
| Payment fails | Check user has USDC, facilitator has AVAX |
| Env vars not working | Redeploy after adding variables |
| Wrong recipient | Check `NEXT_PUBLIC_PAYMENT_RECIPIENT` |

---

## SUPPORT

- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/support  
- **x402 Protocol**: https://github.com/x402-rs/x402-rs

---

## SUCCESS CRITERIA

✅ Facilitator responds to `/supported`  
✅ Frontend loads without errors  
✅ Wallet connects to Avalanche Fuji  
✅ Payment completes successfully  
✅ USDC received at correct address  
✅ Transaction visible on Snowtrace  
✅ Builder Hub access granted  

**🎉 Your x402 payment protocol is LIVE!**

