import { type NextRequest, NextResponse } from "next/server"

// Mock votes data
const votes: any[] = [
  {
    id: "vote_001",
    proposalId: "PENNY_001",
    voter: "bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph",
    vote: "up",
    timestamp: "2025-01-27T10:30:00Z",
    weight: 1,
  },
  {
    id: "vote_002",
    proposalId: "PENNY_001",
    voter: "bc1qmember2345678901234567890123456789012",
    vote: "up",
    timestamp: "2025-01-27T11:00:00Z",
    weight: 1,
  },
  {
    id: "vote_003",
    proposalId: "PDAO_001",
    voter: "bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph",
    vote: "down",
    timestamp: "2025-01-27T12:00:00Z",
    weight: 1,
  },
]

export async function GET() {
  return NextResponse.json(votes)
}

export async function POST(request: NextRequest) {
  try {
    const { proposalId, vote, voter } = await request.json()

    // Check if user already voted
    const existingVote = votes.find((v) => v.proposalId === proposalId && v.voter === voter)
    if (existingVote) {
      return NextResponse.json({ error: "User already voted on this proposal" }, { status: 400 })
    }

    // Add new vote
    const newVote = {
      id: `vote_${Date.now()}`,
      proposalId,
      voter,
      vote,
      timestamp: new Date().toISOString(),
      weight: 1,
    }

    votes.push(newVote)

    return NextResponse.json({ success: true, vote: newVote })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
