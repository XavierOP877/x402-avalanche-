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
"[project]/app/api/facilitators/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Mock facilitator data
const facilitators = [
    {
        id: "1",
        name: "facilitator-us-east-1",
        stake: "50,000 FSC",
        uptime: "99.9%",
        lastSeen: "2 mins ago",
        region: "US East",
        rewards: "450 FSC",
        status: "active"
    },
    {
        id: "2",
        name: "facilitator-eu-central-1",
        stake: "75,000 FSC",
        uptime: "99.8%",
        lastSeen: "5 mins ago",
        region: "EU Central",
        rewards: "680 FSC",
        status: "active"
    },
    {
        id: "3",
        name: "facilitator-ap-southeast-2",
        stake: "40,000 FSC",
        uptime: "98.5%",
        lastSeen: "12 mins ago",
        region: "AP Southeast",
        rewards: "320 FSC",
        status: "active"
    },
    {
        id: "4",
        name: "facilitator-us-west-1",
        stake: "60,000 FSC",
        uptime: "99.7%",
        lastSeen: "1 min ago",
        region: "US West",
        rewards: "520 FSC",
        status: "active"
    },
    {
        id: "5",
        name: "facilitator-eu-west-2",
        stake: "85,000 FSC",
        uptime: "99.9%",
        lastSeen: "3 mins ago",
        region: "EU West",
        rewards: "780 FSC",
        status: "active"
    },
    {
        id: "6",
        name: "facilitator-ap-northeast-1",
        stake: "45,000 FSC",
        uptime: "97.2%",
        lastSeen: "45 mins ago",
        region: "AP Northeast",
        rewards: "280 FSC",
        status: "inactive"
    }
];
async function GET() {
    // Simulate API delay
    await new Promise((resolve)=>setTimeout(resolve, 500));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(facilitators);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5073d34f._.js.map