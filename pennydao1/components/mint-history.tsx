"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, CheckCircle, XCircle, TestTube } from "lucide-react"

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

interface MintHistoryProps {
  mintLogs: MintLog[]
}

export default function MintHistory({ mintLogs }: MintHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800"
      case "simulated":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="h-4 w-4" />
      case "simulated":
        return <TestTube className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = (txid: string) => {
    window.open(`https://mempool.space/tx/${txid}`, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint History</CardTitle>
        <CardDescription>Track all BRC-20 minting operations and their results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mintLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No mint operations recorded yet.</div>
          ) : (
            mintLogs.map((log, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{log.proposalId}</h3>
                    <Badge className={getStatusColor(log.status)}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">{log.status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Token:</span> {log.token}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> {log.amount}
                  </div>
                  <div>
                    <span className="font-medium">To:</span>
                    <span className="font-mono text-xs ml-1">
                      {log.to.slice(0, 10)}...{log.to.slice(-6)}
                    </span>
                  </div>
                </div>

                {log.txid && log.status !== "simulated" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Transaction ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.txid.slice(0, 16)}...{log.txid.slice(-8)}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(log.txid)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openInExplorer(log.txid)}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>

                    {log.inscriptionId && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Inscription ID:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.inscriptionId.slice(0, 16)}...{log.inscriptionId.slice(-8)}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(log.inscriptionId!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
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
