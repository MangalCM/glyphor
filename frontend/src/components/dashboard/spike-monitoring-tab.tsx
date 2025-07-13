import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, TrendingUp, CheckCircle, Search, Filter, ChevronDown, ChevronRight } from "lucide-react"

export function SpikeMonitoringTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const spikes = [
    {
      id: 1,
      timestamp: "2024-01-15 14:23:12",
      location: "Hyderabad MFC",
      product: "Samsung Galaxy S24",
      severity: "critical",
      demandSpike: "+145%",
      currentStock: 23,
      recommendedAction: "Immediate transfer from Mumbai MFC (150 units available)",
      status: "active",
      details: {
        triggerReason: "Flash sale announcement",
        expectedDuration: "2-4 hours",
        impactedStores: ["Store #1247", "Store #1251", "Store #1263"],
        transferCost: "$450",
        timeline: "Transfer can complete in 6 hours"
      }
    },
    {
      id: 2,
      timestamp: "2024-01-15 13:45:08",
      location: "Mumbai MFC",
      product: "iPhone 15 Pro",
      severity: "warning",
      demandSpike: "+67%",
      currentStock: 45,
      recommendedAction: "Monitor closely, consider transfer from Delhi MFC",
      status: "monitoring",
      details: {
        triggerReason: "Regional promotion campaign",
        expectedDuration: "6-8 hours",
        impactedStores: ["Store #2101", "Store #2115"],
        transferCost: "$320",
        timeline: "Transfer can complete in 4 hours"
      }
    },
    {
      id: 3,
      timestamp: "2024-01-15 12:18:33",
      location: "Delhi MFC", 
      product: "OnePlus 12",
      severity: "resolved",
      demandSpike: "+89%",
      currentStock: 78,
      recommendedAction: "Spike resolved - normal operations resumed",
      status: "resolved",
      details: {
        triggerReason: "Social media viral post",
        expectedDuration: "1-2 hours",
        impactedStores: ["Store #3021"],
        transferCost: "$0",
        timeline: "No action required"
      }
    }
  ]

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning': return <TrendingUp className="h-4 w-4 text-warning" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-success" />
      default: return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'warning': return 'bg-warning text-warning-foreground'
      case 'resolved': return 'bg-success text-success-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const filteredSpikes = spikes.filter(spike => {
    const matchesSearch = spike.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spike.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || spike.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-accent" />
          Spike Monitoring
        </h2>
        <Badge variant="outline" className="text-sm">
          {filteredSpikes.filter(s => s.status === 'active').length} Active Spikes
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Spike Events */}
      <div className="space-y-4">
        {filteredSpikes.map((spike) => (
          <Card key={spike.id} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(spike.id)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedRows.has(spike.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(spike.severity)}
                      <div>
                        <div className="font-medium">{spike.product}</div>
                        <div className="text-sm text-muted-foreground">{spike.location}</div>
                      </div>
                    </div>

                    <Badge className={getSeverityColor(spike.severity)}>
                      {spike.severity}
                    </Badge>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Spike: </span>
                      <span className="font-medium text-destructive">{spike.demandSpike}</span>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Stock: </span>
                      <span className="font-medium">{spike.currentStock} units</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{spike.timestamp}</div>
                    <Badge variant="outline" className="mt-1">
                      {spike.status}
                    </Badge>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRows.has(spike.id) && (
                  <div className="ml-10 p-4 bg-muted/50 rounded-lg space-y-3">
                    <div>
                      <span className="font-medium text-sm">Recommended Action:</span>
                      <p className="text-sm text-muted-foreground mt-1">{spike.recommendedAction}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Trigger Reason:</span>
                        <p className="text-muted-foreground">{spike.details.triggerReason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Expected Duration:</span>
                        <p className="text-muted-foreground">{spike.details.expectedDuration}</p>
                      </div>
                      <div>
                        <span className="font-medium">Transfer Cost:</span>
                        <p className="text-muted-foreground">{spike.details.transferCost}</p>
                      </div>
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p className="text-muted-foreground">{spike.details.timeline}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Impacted Stores:</span>
                      <div className="flex gap-2 mt-1">
                        {spike.details.impactedStores.map((store, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {store}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {spike.status === 'active' && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="destructive" className="text-xs">
                          Mark as Critical
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Ignore
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}