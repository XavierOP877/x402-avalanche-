module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/agents/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Mock agent data
const agents = [
    {
        id: "1",
        name: "DeFi Arbitrage Agent",
        capabilities: [
            "Trading",
            "Price Discovery",
            "Arbitrage"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/defi-arb",
        reputation: 5,
        version: "2.1.0",
        category: "DeFi",
        description: "Automated arbitrage across multiple DEX protocols with optimized gas strategies"
    },
    {
        id: "2",
        name: "Oracle Data Agent",
        capabilities: [
            "Price Feeds",
            "Data Aggregation",
            "Verification"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/oracle-data",
        reputation: 4,
        version: "1.8.2",
        category: "Oracle",
        description: "Real-time price feeds and data aggregation from multiple trusted sources"
    },
    {
        id: "3",
        name: "Security Monitor Agent",
        capabilities: [
            "Monitoring",
            "Alerts",
            "Risk Analysis"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/security-mon",
        reputation: 5,
        version: "3.0.1",
        category: "Security",
        description: "Continuous security monitoring with smart contract vulnerability detection"
    },
    {
        id: "4",
        name: "Liquidity Provider Agent",
        capabilities: [
            "Liquidity",
            "Yield Optimization",
            "Rebalancing"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/liquidity-pro",
        reputation: 4,
        version: "1.5.0",
        category: "DeFi",
        description: "Automated liquidity provision with dynamic pool rebalancing strategies"
    },
    {
        id: "5",
        name: "NFT Marketplace Agent",
        capabilities: [
            "NFT Trading",
            "Price Analysis",
            "Rarity Scoring"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/nft-market",
        reputation: 4,
        version: "2.3.1",
        category: "Trading",
        description: "NFT marketplace aggregation with advanced rarity and pricing analytics"
    },
    {
        id: "6",
        name: "Governance Voting Agent",
        capabilities: [
            "DAO Governance",
            "Proposal Analysis",
            "Voting"
        ],
        apiEndpoint: "https://api.fascinet.network/agent/gov-vote",
        reputation: 5,
        version: "1.2.0",
        category: "Utility",
        description: "Automated governance participation with AI-powered proposal analysis"
    }
];
async function GET() {
    // Simulate API delay
    await new Promise((resolve)=>setTimeout(resolve, 600));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(agents);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f2250b4a._.js.map