"use client"

import React, { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface ExplorerLog {
  id: string
  timestamp: number
  eventType: string
  facilitatorId?: string
  facilitatorName?: string
  txHash?: string
  chainName?: string
  amount?: string
  status: 'success' | 'failed' | 'pending'
}

interface Facilitator {
  id: string
  status: string
}

export default function ExplorerPage() {
  const [logs, setLogs] = useState<ExplorerLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchExplorerLogs()
  }, [])

  const fetchExplorerLogs = async () => {
    try {
      setLoading(true)

      // Fetch all logs (no filtering by active facilitators here)
      const logsResponse = await fetch('/api/explorer/logs?limit=200')
      const logsData = await logsResponse.json()

      if (logsData.success) {
        setLogs(logsData.logs)
      }
    } catch (error) {
      console.error('Failed to fetch explorer logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'facilitator_added':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'facilitator_activated':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'transaction':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'status_changed':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'text-white/40 bg-white/5 border-white/10'
    }
  }

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').toUpperCase()
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Filter logs based on selected filter
  const getFilteredLogs = async () => {
    if (filter === 'all') {
      // Show all logs from all facilitators
      return logs
    } else if (filter === 'facilitator_added') {
      // Show only facilitator_added events
      return logs.filter(log => log.eventType === 'facilitator_added')
    } else if (filter === 'facilitator_activated') {
      // Show only facilitator_activated events from currently active facilitators
      // Need to fetch active facilitators
      try {
        const facilitatorsResponse = await fetch('/api/facilitator/list')
        const facilitatorsData = await facilitatorsResponse.json()

        if (facilitatorsData.success) {
          const activeFacilitatorIds = facilitatorsData.facilitators
            .filter((f: Facilitator) => f.status === 'active')
            .map((f: Facilitator) => f.id)

          return logs.filter(log =>
            log.eventType === 'facilitator_activated' &&
            log.facilitatorId &&
            activeFacilitatorIds.includes(log.facilitatorId)
          )
        }
      } catch (error) {
        console.error('Failed to fetch active facilitators:', error)
      }
      return logs.filter(log => log.eventType === 'facilitator_activated')
    } else if (filter === 'status_changed') {
      // Show only status_changed events (deletions, etc)
      return logs.filter(log => log.eventType === 'status_changed')
    }

    return logs.filter(log => log.eventType === filter)
  }

  const [filteredLogs, setFilteredLogs] = React.useState<ExplorerLog[]>([])

  React.useEffect(() => {
    getFilteredLogs().then(setFilteredLogs)
  }, [filter, logs])

  return (
    <div className="relative py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-6 mb-16">
          <div className="flex items-center gap-3 text-primary mb-4">
            <div className="h-px w-8 bg-primary/50" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary/80">Network Explorer</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-mono text-white uppercase tracking-tight">
                Explorer
              </h1>
              <p className="text-xl text-white/50 max-w-2xl font-light leading-relaxed mt-4">
                Real-time activity from active facilitators on the x402 network
              </p>
            </div>
            <Link
              href="/facilitator"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-mono text-sm"
            >
              ← Back to Facilitators
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['all', 'facilitator_added', 'facilitator_activated', 'status_changed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
                filter === filterType
                  ? 'bg-primary text-black'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {filterType === 'all' ? 'All Events' : formatEventType(filterType)}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-t-lg border border-white/10 font-mono text-xs text-white/40 uppercase tracking-wider">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Event Type</div>
            <div className="col-span-3">Facilitator</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Details</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-white/40">Loading logs...</div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-colors items-center"
                >
                  <div className="col-span-2 text-xs text-white/60 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="col-span-3">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${getEventTypeColor(log.eventType)}`}>
                      {formatEventType(log.eventType)}
                    </span>
                  </div>
                  <div className="col-span-3 text-sm text-white/80 font-mono truncate">
                    {log.facilitatorName || log.facilitatorId?.slice(0, 12) || 'Network'}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                      log.status === 'success'
                        ? 'text-green-400 bg-green-500/10'
                        : log.status === 'failed'
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-yellow-400 bg-yellow-500/10'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {log.txHash && (
                      <a
                        href={`https://testnet.snowtrace.io/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 justify-end"
                      >
                        View TX <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-white/40">
                No logs found for active facilitators
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
