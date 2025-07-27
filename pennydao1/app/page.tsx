"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Clock, CheckCircle, Play, Zap, Users, Shield } from "lucide-react"
import ProposalUpload from "@/components/proposal-upload"
import MintHistory from "@/components/mint-history"
import ProposalList from "@/components/proposal-list"
import AdminPanel from "@/components/admin-panel"
import VotingInterface from "@/components/voting-interface"

interface MintLog {
  proposalId: string
  token: string
  amount: string
  to: string
  txid: string
  inscriptionId?: string
  timestamp: string
  status: "submitted" | "simulated" | "failed"
}

interface Vote {
  id: string
  proposalId: string
  voter: string
  vote: "up" | "down"
  timestamp: string
  weight: number
}

interface Proposal {
  id: string
  type: string
  token: string
  amount: string
  to: string
  status: "pending" | "voting" | "approved" | "rejected" | "minted"
  createdAt: string
  description?: string
  createdBy: string
  votingEnds?: string
  votes: {
    up: number
    down: number
    total: number
  }
  requiredVotes: number
}

export default function PennyDAODashboard() {
  const [mintLogs, setMintLogs] = useState<MintLog[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "member" | "guest">("member")
  const [userAddress, setUserAddress] = useState("bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph")
  const [stats, setStats] = useState({
    totalMints: 0,
    successfulMints: 0,
    pendingProposals: 0,
    totalTokensMinted: 0,
    activeVotes: 0,
    totalMembers: 0,
  })

  // Load data on component mount
  useEffect(() => {
    loadMintHistory()
    loadProposals()
    loadVotes()
  }, [])

  // Update stats when data changes
  useEffect(() => {
    updateStats()
  }, [mintLogs, proposals, votes])

  const loadMintHistory = async () => {
    try {
      const response = await fetch("/api/mint-history")
      if (response.ok) {
        const data = await response.json()
        setMintLogs(data)
      }
    } catch (error) {
      console.error("Failed to load mint history:", error)
    }
  }

  const loadProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error("Failed to load proposals:", error)
    }
  }

  const loadVotes = async () => {
    try {
      const response = await fetch("/api/votes")
      if (response.ok) {
        const data = await response.json()
        setVotes(data)
      }
    } catch (error) {
      console.error("Failed to load votes:", error)
    }
  }

  const updateStats = () => {
    const totalMints = mintLogs.length
    const successfulMints = mintLogs.filter((log) => log.status === "submitted").length
    const pendingProposals = proposals.filter((p) => p.status === "approved").length
    const activeVotes = proposals.filter((p) => p.status === "voting").length
    const totalTokensMinted = mintLogs
      .filter((log) => log.status === "submitted")
      .reduce((sum, log) => sum + Number.parseInt(log.amount), 0)

    setStats({
      totalMints,
      successfulMints,
      pendingProposals,
      totalTokensMinted,
      activeVotes,
      totalMembers: 42, // Mock data - would come from member registry
    })
  }

  const processAllProposals = async (dryRun = false) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/process-proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      })

      if (response.ok) {
        await loadMintHistory()
        await loadProposals()
      }
    } catch (error) {
      console.error("Failed to process proposals:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processSingleProposal = async (proposalId: string, dryRun = false) => {
    try {
      const response = await fetch("/api/process-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, dryRun }),
      })

      if (response.ok) {
        await loadMintHistory()
        await loadProposals()
      }
    } catch (error) {
      console.error("Failed to process proposal:", error)
    }
  }

  const handleVote = async (proposalId: string, vote: "up" | "down") => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          vote,
          voter: userAddress,
        }),
      })

      if (response.ok) {
        await loadProposals()
        await loadVotes()
      }
    } catch (error) {
      console.error("Failed to submit vote:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Penny DAO Branding */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Coins className="h-12 w-12 text-amber-600" />
              <Zap className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Penny DAO
              </h1>
              <p className="text-lg text-amber-700 font-medium">Governance & Mint Manager</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">Role: {userRole}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800 font-mono text-xs">
                {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Total Mints</CardTitle>
              <Coins className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{stats.totalMints}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.successfulMints}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{stats.pendingProposals}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Active Votes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.activeVotes}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.totalMembers}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Pennies</CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats.totalTokensMinted.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => processAllProposals(false)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Execute Approved Proposals"}
          </Button>

          <Button
            onClick={() => processAllProposals(true)}
            disabled={isProcessing}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Play className="h-4 w-4 mr-2" />
            Dry Run All
          </Button>
        </div>

        {/* Enhanced Tabs with Voting */}
        <Tabs defaultValue="proposals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-amber-100">
            <TabsTrigger value="proposals" className="data-[state=active]:bg-amber-200">
              Proposals
            </TabsTrigger>
            <TabsTrigger value="voting" className="data-[state=active]:bg-amber-200">
              Active Votes
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-amber-200">
              Mint History
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-amber-200">
              New Proposal
            </TabsTrigger>
            {userRole === "admin" && (
              <TabsTrigger value="admin" className="data-[state=active]:bg-amber-200">
                Admin Panel
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="proposals">
            <ProposalList
              proposals={proposals}
              onProcessProposal={processSingleProposal}
              userRole={userRole}
              userAddress={userAddress}
              onVote={handleVote}
              votes={votes}
            />
          </TabsContent>

          <TabsContent value="voting">
            <VotingInterface
              proposals={proposals.filter((p) => p.status === "voting")}
              votes={votes}
              onVote={handleVote}
              userAddress={userAddress}
            />
          </TabsContent>

          <TabsContent value="history">
            <MintHistory mintLogs={mintLogs} />
          </TabsContent>

          <TabsContent value="create">
            <ProposalUpload onUploadComplete={loadProposals} userRole={userRole} />
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="admin">
              <AdminPanel
                proposals={proposals}
                votes={votes}
                onRefresh={() => {
                  loadProposals()
                  loadVotes()
                }}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Penny DAO Footer */}
        <div className="text-center py-8 border-t border-amber-200">
          <p className="text-amber-600 text-sm">
            🪙 Powered by Penny DAO • Democratic governance for copper penny-backed assets
          </p>
        </div>
      </div>
    </div>
  )
}
