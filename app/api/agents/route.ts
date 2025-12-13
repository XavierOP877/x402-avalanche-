import { NextResponse } from "next/server"

// Mock agent data
const agents = [
  {
    id: "1",
    name: "DeFi Arbitrage Agent",
    capabilities: ["Trading", "Price Discovery", "Arbitrage"],
    apiEndpoint: "https://api.fascinet.network/agent/defi-arb",
    reputation: 5,
    version: "2.1.0",
    category: "DeFi",
    description: "Automated arbitrage across multiple DEX protocols with optimized gas strategies",
  },
  {
    id: "2",
    name: "Oracle Data Agent",
    capabilities: ["Price Feeds", "Data Aggregation", "Verification"],
    apiEndpoint: "https://api.fascinet.network/agent/oracle-data",
    reputation: 4,
    version: "1.8.2",
    category: "Oracle",
    description: "Real-time price feeds and data aggregation from multiple trusted sources",
  },
  {
    id: "3",
    name: "Security Monitor Agent",
    capabilities: ["Monitoring", "Alerts", "Risk Analysis"],
    apiEndpoint: "https://api.fascinet.network/agent/security-mon",
    reputation: 5,
    version: "3.0.1",
    category: "Security",
    description: "Continuous security monitoring with smart contract vulnerability detection",
  },
  {
    id: "4",
    name: "Liquidity Provider Agent",
    capabilities: ["Liquidity", "Yield Optimization", "Rebalancing"],
    apiEndpoint: "https://api.fascinet.network/agent/liquidity-pro",
    reputation: 4,
    version: "1.5.0",
    category: "DeFi",
    description: "Automated liquidity provision with dynamic pool rebalancing strategies",
  },
  {
    id: "5",
    name: "NFT Marketplace Agent",
    capabilities: ["NFT Trading", "Price Analysis", "Rarity Scoring"],
    apiEndpoint: "https://api.fascinet.network/agent/nft-market",
    reputation: 4,
    version: "2.3.1",
    category: "Trading",
    description: "NFT marketplace aggregation with advanced rarity and pricing analytics",
  },
  {
    id: "6",
    name: "Governance Voting Agent",
    capabilities: ["DAO Governance", "Proposal Analysis", "Voting"],
    apiEndpoint: "https://api.fascinet.network/agent/gov-vote",
    reputation: 5,
    version: "1.2.0",
    category: "Utility",
    description: "Automated governance participation with AI-powered proposal analysis",
  },
]

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  return NextResponse.json(agents)
}
