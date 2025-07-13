import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Warehouse, Store, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"

export function MapViewTab() {
  const fulfillmentCenters = [
    {
      id: 1,
      name: "Mumbai MFC",
      type: "fulfillment",
      location: { lat: 19.0760, lng: 72.8777 },
      status: "overstocked",
      inventory: 1250,
      capacity: 1000,
      products: ["Samsung Galaxy S24", "iPhone 15 Pro", "OnePlus 12"]
    },
    {
      id: 2,
      name: "Delhi MFC", 
      type: "fulfillment",
      location: { lat: 28.7041, lng: 77.1025 },
      status: "stable",
      inventory: 890,
      capacity: 1200,
      products: ["Xiaomi 14", "Google Pixel 8", "Nothing Phone 2"]
    },
    {
      id: 3,
      name: "Bangalore MFC",
      type: "fulfillment", 
      location: { lat: 12.9716, lng: 77.5946 },
      status: "stockout_risk",
      inventory: 234,
      capacity: 800,
      products: ["Samsung Galaxy S24", "OnePlus 12"]
    },
    {
      id: 4,
      name: "Hyderabad MFC",
      type: "fulfillment",
      location: { lat: 17.3850, lng: 78.4867 },
      status: "stockout_risk", 
      inventory: 156,
      capacity: 600,
      products: ["iPhone 15 Pro", "Samsung Galaxy S24"]
    }
  ]

  const stores = [
    { id: 1, name: "Store #1247", type: "store", status: "stable", demand: "high" },
    { id: 2, name: "Store #1251", type: "store", status: "stockout_risk", demand: "critical" },
    { id: 3, name: "Store #2101", type: "store", status: "overstocked", demand: "low" },
    { id: 4, name: "Store #3021", type: "store", status: "stable", demand: "medium" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overstocked': return 'text-destructive bg-destructive/10 border-destructive'
      case 'stockout_risk': return 'text-warning bg-warning/10 border-warning'
      case 'stable': return 'text-success bg-success/10 border-success'
      default: return 'text-muted-foreground bg-muted/10 border-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overstocked': return <AlertCircle className="h-4 w-4" />
      case 'stockout_risk': return <AlertTriangle className="h-4 w-4" />
      case 'stable': return <CheckCircle2 className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Distribution Map View
        </h2>
        <Badge variant="outline" className="text-sm">
          {fulfillmentCenters.length} MFCs • {stores.length} Stores
        </Badge>
      </div>

      {/* Map Placeholder with Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Interactive Google Maps</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Map integration would show fulfillment centers and stores<br />
                  with real-time status indicators and transfer routes
                </p>
                
                {/* Status Legend */}
                <div className="mt-6 flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span>Overstocked</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>Stockout Risk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Fulfillment Centers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                MFCs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fulfillmentCenters.map((center) => (
                <div key={center.id} className={`p-3 rounded-lg border ${getStatusColor(center.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{center.name}</span>
                    {getStatusIcon(center.status)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Inventory: {center.inventory}/{center.capacity}</div>
                    <div className="text-muted-foreground">
                      {Math.round((center.inventory / center.capacity) * 100)}% capacity
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Stores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className={`p-3 rounded-lg border ${getStatusColor(store.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{store.name}</span>
                    {getStatusIcon(store.status)}
                  </div>
                  <div className="text-xs">
                    <Badge variant="outline" className="text-xs">
                      {store.demand} demand
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-warning rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Critical Transfer</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Hyderabad MFC critically low on Samsung Galaxy S24
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Initiate Transfer
              </Button>
            </div>

            <div className="p-4 border border-primary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Optimization</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Mumbai MFC has excess inventory for redistribution
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Optimize Route
              </Button>
            </div>

            <div className="p-4 border border-accent rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm">Route Planning</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Plan optimal distribution routes for next delivery cycle
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Plan Routes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}