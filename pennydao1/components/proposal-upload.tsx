"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Plus, Zap, Coins } from "lucide-react"

interface ProposalUploadProps {
  onUploadComplete: () => void
}

export default function ProposalUpload({ onUploadComplete }: ProposalUploadProps) {
  const [formData, setFormData] = useState({
    token: "PENNY",
    amount: "",
    to: "",
  })
  const [jsonInput, setJsonInput] = useState("")
  const [uploadMode, setUploadMode] = useState<"form" | "json">("form")
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Penny DAO token presets
  const tokenPresets = [
    { value: "PENNY", label: "PENNY - Official Penny DAO Token" },
    { value: "PDAO", label: "PDAO - Governance Token" },
    { value: "SATS", label: "SATS - Satoshi Tribute" },
    { value: "CUSTOM", label: "Custom Token" },
  ]

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setMessage(null)

    try {
      const proposal = {
        type: "mint",
        ...formData,
        status: "approved", // Auto-approve for Penny DAO
        createdAt: new Date().toISOString(),
      }

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Penny DAO proposal created successfully! 🪙" })
        setFormData({ token: "PENNY", amount: "", to: "" })
        onUploadComplete()
      } else {
        throw new Error("Failed to create proposal")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create proposal. Please try again." })
    } finally {
      setIsUploading(false)
    }
  }

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setMessage(null)

    try {
      const proposal = JSON.parse(jsonInput)
      proposal.status = "approved" // Auto-approve for Penny DAO
      proposal.createdAt = new Date().toISOString()

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Penny DAO proposal uploaded successfully! 🪙" })
        setJsonInput("")
        onUploadComplete()
      } else {
        throw new Error("Failed to upload proposal")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Invalid JSON or upload failed. Please check your input." })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    try {
      const text = await file.text()
      const proposal = JSON.parse(text)
      proposal.status = "approved" // Auto-approve for Penny DAO
      proposal.createdAt = new Date().toISOString()

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Penny DAO proposal file uploaded successfully! 🪙" })
        onUploadComplete()
      } else {
        throw new Error("Failed to upload proposal")
      }
    } catch (error) {
      setMessage({ type: "error", text: "Invalid file format or upload failed." })
    } finally {
      setIsUploading(false)
      e.target.value = "" // Reset file input
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Zap className="h-5 w-5 text-amber-600" />
            Create New Penny DAO Proposal
          </CardTitle>
          <CardDescription className="text-amber-700">
            Submit a new BRC-20 mint proposal for Penny DAO governance approval
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {message && (
            <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant={uploadMode === "form" ? "default" : "outline"}
              onClick={() => setUploadMode("form")}
              size="sm"
              className={uploadMode === "form" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Form Builder
            </Button>
            <Button
              variant={uploadMode === "json" ? "default" : "outline"}
              onClick={() => setUploadMode("json")}
              size="sm"
              className={uploadMode === "json" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Editor
            </Button>
          </div>

          {uploadMode === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-amber-800">
                    Token Symbol
                  </Label>
                  <Select value={formData.token} onValueChange={(value) => setFormData({ ...formData, token: value })}>
                    <SelectTrigger className="border-amber-200">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokenPresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-amber-800">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g., 1000000"
                    className="border-amber-200"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-amber-800">
                  Recipient Address
                </Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  placeholder="bc1q... (Bitcoin address)"
                  className="border-amber-200"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                <Coins className="h-4 w-4 mr-2" />
                {isUploading ? "Creating Proposal..." : "Create Penny DAO Proposal"}
              </Button>
            </form>
          )}

          {uploadMode === "json" && (
            <form onSubmit={handleJsonSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json" className="text-amber-800">
                  JSON Proposal
                </Label>
                <Textarea
                  id="json"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{
  "type": "mint",
  "token": "PENNY",
  "amount": "1000000",
  "to": "bc1q..."
}`}
                  rows={8}
                  className="border-amber-200 font-mono"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload JSON Proposal"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Upload className="h-5 w-5 text-amber-600" />
            Upload Proposal File
          </CardTitle>
          <CardDescription className="text-amber-700">
            Upload a JSON proposal file directly to Penny DAO
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center bg-gradient-to-br from-amber-50 to-yellow-50">
            <Upload className="h-12 w-12 mx-auto text-amber-400 mb-4" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-amber-700 font-medium">Click to upload a proposal file</span>
              <br />
              <span className="text-sm text-amber-600">or drag and drop your JSON file here</span>
              <Input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
