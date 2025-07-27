"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ThumbsUp, ThumbsDown, Clock, Users, Zap, AlertCircle } from "lucide-react"

interface Proposal {
  id: string
  type: string
  token: string
  amount: string
  to: string
  status: string
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

interface Vote {
  id: string
  proposalId: string
  voter: string
  vote: "up" | "down"
  timestamp: string
  weight: number
}

interface VotingInterfaceProps {
  proposals: Proposal[]
  votes: Vote[]
  onVote: (proposalId: string, vote: "up" | "down") => void
  userAddress: string
}

export default function VotingInterface({ proposals, votes, onVote, userAddress }: VotingInterfaceProps) {
  const hasUserVoted = (proposalId: string) => {
    return votes.some((vote) => vote.proposalId === proposalId && vote.voter === userAddress)
  }

  const getUserVote = (proposalId: string) => {
    const vote = votes.find((vote) => vote.proposalId === proposalId && vote.voter === userAddress)
    return vote?.vote
  }

  const getVoteProgress = (proposal: Proposal) => {
    const totalVotes = proposal.votes.up + proposal.votes.down
    const upPercentage = totalVotes > 0 ? (proposal.votes.up / totalVotes) * 100 : 0
    return upPercentage
  }

  const getTimeRemaining = (votingEnds?: string) => {
    if (!votingEnds) return "No deadline"
    const now = new Date()
    const end = new Date(votingEnds)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Voting ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const getVoteStatus = (proposal: Proposal) => {
    const progress = getVoteProgress(proposal)
    const totalVotes = proposal.votes.up + proposal.votes.down

    if (totalVotes >= proposal.requiredVotes && progress > 50) {
      return { status: "passing", color: "text-green-600", bg: "bg-green-100" }
    } else if (totalVotes >= proposal.requiredVotes && progress <= 50) {
      return { status: "failing", color: "text-red-600", bg: "bg-red-100" }
    } else {
      return { status: "pending", color: "text-yellow-600", bg: "bg-yellow-100" }
    }
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Users className="h-5 w-5 text-amber-600" />
          Active Governance Votes
        </CardTitle>
        <CardDescription className="text-amber-700">
          Vote on proposals to mint new copper penny-backed tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {proposals.length === 0 ? (
            <div className="text-center py-12 text-amber-600">
              <Users className="h-12 w-12 mx-auto mb-4 text-amber-400" />
              <p className="text-lg font-medium">No active votes</p>
              <p className="text-sm">All proposals are either pending or have been decided</p>
            </div>
          ) : (
            proposals.map((proposal) => {
              const userVote = getUserVote(proposal.id)
              const hasVoted = hasUserVoted(proposal.id)
              const voteStatus = getVoteStatus(proposal)
              const progress = getVoteProgress(proposal)

              return (
                <div
                  key={proposal.id}
                  className="border border-amber-100 rounded-lg p-6 space-y-4 bg-gradient-to-r from-white to-amber-50"
                >
                  {/* Proposal Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-amber-900">{proposal.id}</h3>
                        <Badge className={`${voteStatus.bg} ${voteStatus.color} border-0`}>{voteStatus.status}</Badge>
                        {proposal.token === "PENNY" && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Zap className="h-3 w-3 mr-1" />
                            Official Token
                          </Badge>
                        )}
                      </div>
                      <p className="text-amber-700 text-sm">{proposal.description}</p>
                    </div>
                    <div className="text-right text-sm text-amber-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(proposal.votingEnds)}
                      </div>
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-amber-50 p-3 rounded">
                    <div>
                      <span className="font-medium text-amber-800">Token:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-amber-900">{proposal.token}</span>
                    </div>
                    <div>
                      <span className="font-medium text-amber-800">Amount:</span>
                      <span className="ml-2 font-mono bg-white px-2 py-1 rounded text-amber-900">
                        {Number(proposal.amount).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-amber-800">Copper Weight:</span>
                      <span className="ml-2 text-amber-900">{Math.round(Number(proposal.amount) * 3.11 * 0.95)}g</span>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-800 font-medium">Voting Progress</span>
                      <span className="text-amber-600">
                        {proposal.votes.up + proposal.votes.down} / {proposal.requiredVotes} votes
                      </span>
                    </div>

                    <Progress value={progress} className="h-3" />

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{proposal.votes.up} Yes</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="h-3 w-3" />
                          <span>{proposal.votes.down} No</span>
                        </div>
                      </div>
                      <div className="text-amber-600">{Math.round(progress)}% approval</div>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                    <div className="flex gap-3">
                      {!hasVoted ? (
                        <>
                          <Button
                            onClick={() => onVote(proposal.id, "up")}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Vote Yes
                          </Button>
                          <Button
                            onClick={() => onVote(proposal.id, "down")}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Vote No
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              userVote === "up"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {userVote === "up" ? (
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

                    {proposal.votes.up + proposal.votes.down >= proposal.requiredVotes && (
                      <div className="flex items-center gap-1 text-sm">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        <span className="text-amber-600">Ready for execution</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
