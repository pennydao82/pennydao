import { NextResponse } from "next/server"

// Mock Penny DAO mint history
const mintHistory = [
  {
    proposalId: "PENNY_001",
    token: "PENNY",
    amount: "1000000",
    to: "bc1qpenny123456789abcdef0123456789abcdef01",
    txid: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    inscriptionId: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456i0",
    timestamp: "2025-01-27T12:00:00Z",
    status: "submitted",
  },
  {
    proposalId: "PDAO_TEST",
    token: "PDAO",
    amount: "10000",
    to: "bc1qtest123456789abcdef0123456789abcdef01",
    txid: "dry-run-txid",
    timestamp: "2025-01-27T11:30:00Z",
    status: "simulated",
  },
  {
    proposalId: "PENNY_002",
    token: "PENNY",
    amount: "500000",
    to: "bc1qpenny987654321fedcba9876543210fedcba98",
    txid: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1",
    inscriptionId: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1i0",
    timestamp: "2025-01-27T10:30:00Z",
    status: "submitted",
  },
]

export async function GET() {
  return NextResponse.json(mintHistory)
}
