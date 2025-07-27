import { type NextRequest, NextResponse } from "next/server"

// Mock Penny DAO proposals
const proposals: any[] = [
  {
    id: "PENNY_001",
    type: "mint",
    token: "PENNY",
    amount: "1000",
    to: "bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph",
    status: "voting",
    createdAt: "2025-01-27T10:00:00Z",
    description: "Initial PennyDAO mint backed by 1000 pre-1982 copper pennies",
    createdBy: "admin",
    votingEnds: "2025-02-03T10:00:00Z",
    votes: { up: 3, down: 1, total: 4 },
    requiredVotes: 5,
  },
  {
    id: "PDAO_001",
    type: "mint",
    token: "PDAO",
    amount: "50000",
    to: "bc1qpdao987654321fedcba9876543210fedcba98",
    status: "voting",
    createdAt: "2025-01-27T11:00:00Z",
    description: "Governance token mint for active DAO members",
    createdBy: "member",
    votingEnds: "2025-02-03T11:00:00Z",
    votes: { up: 2, down: 3, total: 5 },
    requiredVotes: 5,
  },
  {
    id: "SATS_001",
    type: "mint",
    token: "SATS",
    amount: "2100000",
    to: "bc1qsats456789012345678901234567890123456",
    status: "approved",
    createdAt: "2025-01-27T12:00:00Z",
    description: "Satoshi tribute token - approved by community vote",
    createdBy: "member",
    votes: { up: 8, down: 1, total: 9 },
    requiredVotes: 5,
  },
]

export async function GET() {
  return NextResponse.json(proposals)
}

export async function POST(request: NextRequest) {
  try {
    const proposal = await request.json()

    // Generate Penny DAO specific ID if not provided
    if (!proposal.id) {
      const tokenPrefix = proposal.token || "PENNY"
      const timestamp = Date.now()
      proposal.id = `${tokenPrefix}_${timestamp}`
    }

    // Add timestamp if not provided
    if (!proposal.createdAt) {
      proposal.createdAt = new Date().toISOString()
    }

    proposals.push(proposal)

    return NextResponse.json({ success: true, id: proposal.id })
  } catch (error) {
    return NextResponse.json({ error: "Invalid proposal data" }, { status: 400 })
  }
}
