"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Plus, Settings, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

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

interface AdminPanelProps {
  proposals: Proposal[]
  votes: Vote[]
  onRefresh: () => void
}

export default function AdminPanel({ proposals, votes, onRefresh }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "settings">("create")
  const [newProposal, setNewProposal] = useState({
    token: "PENNY",
    amount: "",
    to: "",
    description: "",
    requiredVotes: "5",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const proposal = {
        type: "mint",
        ...newProposal,
        status: "voting", // Admin proposals go straight to voting
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        votes: { up: 0, down: 0, total: 0 },
        requiredVotes: Number(newProposal.requiredVotes),
      }

      const response = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Proposal created and sent to voting!" })
        setNewProposal({ token: "PENNY", amount: "", to: "", description: "", requiredVotes: "5" })
        onRefresh()
      } else {
        throw new Error("Failed to create proposal")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create proposal" })
    }
  }

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/proposals/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, status: newStatus }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: `Proposal status updated to ${newStatus}` })
        onRefresh()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update proposal status" })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "voting":
        return <Users className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Shield className="h-5 w-5 text-red-600" />
            PennyDAO Admin Panel
          </CardTitle>
          <CardDescription className="text-red-700">
            Administrative controls for managing proposals, voting, and DAO operations
          </CardDescription>
        </CardHeader>
      </Card>

      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "create" ? "default" : "outline"}
          onClick={() => setActiveTab("create")}
          size="sm"
          className={activeTab === "create" ? "bg-red-500 hover:bg-red-600" : "border-red-300 text-red-700"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
        <Button
          variant={activeTab === "manage" ? "default" : "outline"}
          onClick={() => setActiveTab("manage")}
          size="sm"
          className={activeTab === "manage" ? "bg-red-500 hover:bg-red-600" : "border-red-300 text-red-700"}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Proposals
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "outline"}
          onClick={() => setActiveTab("settings")}
          size="sm"
          className={activeTab === "settings" ? "bg-red-500 hover:bg-red-600" : "border-red-300 text-red-700"}
        >
          <Users className="h-4 w-4 mr-2" />
          DAO Settings
        </Button>
      </div>

      {/* Create Proposal Tab */}
      {activeTab === "create" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Create New Proposal</CardTitle>
            <CardDescription className="text-red-700">
              Create a new mint proposal that will go directly to community voting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-token" className="text-red-800">
                    Token Symbol
                  </Label>
                  <Select
                    value={newProposal.token}
                    onValueChange={(value) => setNewProposal({ ...newProposal, token: value })}
                  >
                    <SelectTrigger className="border-red-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENNY">PENNY - Official Token</SelectItem>
                      <SelectItem value="PDAO">PDAO - Governance Token</SelectItem>
                      <SelectItem value="SATS">SATS - Satoshi Tribute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-amount" className="text-red-800">
                    Amount
                  </Label>
                  <Input
                    id="admin-amount"
                    value={newProposal.amount}
                    onChange={(e) => setNewProposal({ ...newProposal, amount: e.target.value })}
                    placeholder="e.g., 1000"
                    className="border-red-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-to" className="text-red-800">
                  Recipient Address
                </Label>
                <Input
                  id="admin-to"
                  value={newProposal.to}
                  onChange={(e) => setNewProposal({ ...newProposal, to: e.target.value })}
                  placeholder="bc1q..."
                  className="border-red-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-description" className="text-red-800">
                  Description
                </Label>
                <Textarea
                  id="admin-description"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  placeholder="Describe the purpose of this mint proposal..."
                  className="border-red-200"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-votes" className="text-red-800">
                  Required Votes
                </Label>
                <Select
                  value={newProposal.requiredVotes}
                  onValueChange={(value) => setNewProposal({ ...newProposal, requiredVotes: value })}
                >
                  <SelectTrigger className="border-red-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 votes (Fast track)</SelectItem>
                    <SelectItem value="5">5 votes (Standard)</SelectItem>
                    <SelectItem value="10">10 votes (Major proposal)</SelectItem>
                    <SelectItem value="20">20 votes (Critical proposal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal & Start Voting
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Manage Proposals Tab */}
      {activeTab === "manage" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Manage Proposals</CardTitle>
            <CardDescription className="text-red-700">
              Override proposal statuses and manage the voting process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border border-red-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-red-900">{proposal.id}</h3>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        {getStatusIcon(proposal.status)}
                        <span className="ml-1">{proposal.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-red-600">
                      {proposal.votes.up + proposal.votes.down} / {proposal.requiredVotes} votes
                    </div>
                  </div>

                  <div className="text-sm text-red-700">
                    <strong>Amount:</strong> {proposal.amount} {proposal.token} • <strong>Created by:</strong>{" "}
                    {proposal.createdBy}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(proposal.id, "approved")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(proposal.id, "rejected")}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(proposal.id, "voting")}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Send to Vote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DAO Settings Tab */}
      {activeTab === "settings" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">DAO Settings</CardTitle>
            <CardDescription className="text-red-700">Configure PennyDAO governance parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-red-800">Voting Parameters</h4>
                  <div className="space-y-2">
                    <Label className="text-red-700">Default Voting Period</Label>
                    <Select defaultValue="7">
                      <SelectTrigger className="border-red-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-700">Minimum Quorum</Label>
                    <Input defaultValue="5" className="border-red-200" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-red-800">Treasury Settings</h4>
                  <div className="space-y-2">
                    <Label className="text-red-700">Max Mint Per Proposal</Label>
                    <Input defaultValue="10000" className="border-red-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-700">Copper Ratio</Label>
                    <Input defaultValue="0.95" className="border-red-200" disabled />
                  </div>
                </div>
              </div>

              <Button className="bg-red-500 hover:bg-red-600">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
