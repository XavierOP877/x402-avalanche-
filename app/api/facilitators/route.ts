import { NextResponse } from "next/server"

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
    status: "active" as const,
  },
  {
    id: "2",
    name: "facilitator-eu-central-1",
    stake: "75,000 FSC",
    uptime: "99.8%",
    lastSeen: "5 mins ago",
    region: "EU Central",
    rewards: "680 FSC",
    status: "active" as const,
  },
  {
    id: "3",
    name: "facilitator-ap-southeast-2",
    stake: "40,000 FSC",
    uptime: "98.5%",
    lastSeen: "12 mins ago",
    region: "AP Southeast",
    rewards: "320 FSC",
    status: "active" as const,
  },
  {
    id: "4",
    name: "facilitator-us-west-1",
    stake: "60,000 FSC",
    uptime: "99.7%",
    lastSeen: "1 min ago",
    region: "US West",
    rewards: "520 FSC",
    status: "active" as const,
  },
  {
    id: "5",
    name: "facilitator-eu-west-2",
    stake: "85,000 FSC",
    uptime: "99.9%",
    lastSeen: "3 mins ago",
    region: "EU West",
    rewards: "780 FSC",
    status: "active" as const,
  },
  {
    id: "6",
    name: "facilitator-ap-northeast-1",
    stake: "45,000 FSC",
    uptime: "97.2%",
    lastSeen: "45 mins ago",
    region: "AP Northeast",
    rewards: "280 FSC",
    status: "inactive" as const,
  },
]

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(facilitators)
}
