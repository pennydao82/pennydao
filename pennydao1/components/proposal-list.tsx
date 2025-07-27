"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Play, TestTube, Clock, CheckCircle, Coins, Zap } from "lucide-react"

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
  status: "pending" | "approved" | "minted" | "voting"
  createdAt: string
  votes: {
    up: number
    down: number
  }
  requiredVotes: number
}

interface ProposalListProps {
  proposals: Proposal[]
  onProcessProposal: (proposalId: string, dryRun: boolean) => void
  userRole: "admin" | "member" | "guest"
  userAddress: string
  onVote?: (proposalId: string, vote: "up" | "down") => void
  votes?: Vote[]
}

export default function ProposalList({
  proposals,
  onProcessProposal,
  userRole,
  userAddress,
  onVote,
  votes,
}: ProposalListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "minted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "voting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "minted":
        return <Coins className="h-4 w-4" />
      default:
        return null
    }
  }

  const hasUserVoted = (proposalId: string) => {
    if (!votes || !onVote) return false
    return votes.some((vote) => vote.proposalId === proposalId && vote.voter === userAddress)
  }

  const getUserVote = (proposalId: string) => {
    if (!votes) return null
    const vote = votes.find((vote) => vote.proposalId === proposalId && vote.voter === userAddress)
    return vote?.vote
  }

  const getVoteProgress = (proposal: Proposal) => {
    const totalVotes = proposal.votes.up + proposal.votes.down
    const upPercentage = totalVotes > 0 ? (proposal.votes.up / totalVotes) * 100 : 0
    return upPercentage
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Zap className="h-5 w-5 text-amber-600" />
          Penny DAO Proposals
        </CardTitle>
        <CardDescription className="text-amber-700">
          Manage and execute BRC-20 mint proposals approved by Penny DAO governance
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center py-12 text-amber-600">
              <Coins className="h-12 w-12 mx-auto mb-4 text-amber-400" />
              <p className="text-lg font-medium">No proposals found</p>
              <p className="text-sm">Create a new proposal to start minting tokens for Penny DAO</p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border border-amber-100 rounded-lg p-4 space-y-3 bg-gradient-to-r from-white to-amber-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-amber-900">{proposal.id}</h3>
                    <Badge className={getStatusColor(proposal.status)}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1 capitalize">{proposal.status}</span>
                    </Badge>
                    {proposal.token === "PENNY" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <Zap className="h-3 w-3 mr-1" />
                        Official Token
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-amber-600">{new Date(proposal.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-800">Token:</span>
                    <span className="font-mono bg-amber-100 px-2 py-1 rounded text-amber-900">{proposal.token}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-800">Amount:</span>
                    <span className="font-mono bg-amber-100 px-2 py-1 rounded text-amber-900">
                      {Number(proposal.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-800">To:</span>
                    <span className="font-mono text-xs bg-amber-100 px-2 py-1 rounded text-amber-900">
                      {proposal.to.slice(0, 10)}...{proposal.to.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Enhanced with Voting */}
                {proposal.status === "voting" && onVote && (
                  <div className="space-y-3 pt-3 border-t border-amber-100">
                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700 font-medium">Community Vote</span>
                        <span className="text-amber-600">
                          {proposal.votes.up + proposal.votes.down} / {proposal.requiredVotes} votes needed
                        </span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${getVoteProgress(proposal)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{proposal.votes.up} Yes</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{proposal.votes.down} No</span>
                          </div>
                        </div>
                        <div className="text-amber-600">{Math.round(getVoteProgress(proposal))}% approval</div>
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    <div className="flex gap-2">
                      {!hasUserVoted(proposal.id) ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onVote(proposal.id, "up")}
                            className="bg-green-500 hover:bg-green-600 text-white flex-1"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Vote Yes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onVote(proposal.id, "down")}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 flex-1"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Vote No
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <Badge
                            className={
                              getUserVote(proposal.id) === "up"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {getUserVote(proposal.id) === "up" ? (
                              <>
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                You voted Yes
                              </>
                            ) : (
                              <>
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                You voted No
                              </>
                            )}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {proposal.status === "approved" && (
                  <div className="flex gap-2 pt-3 border-t border-amber-100">
                    <Button
                      size="sm"
                      onClick={() => onProcessProposal(proposal.id, false)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Mint Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onProcessProposal(proposal.id, true)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test Run
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
