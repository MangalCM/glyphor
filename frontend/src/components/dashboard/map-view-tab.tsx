import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Warehouse, Store, AlertCircle, CheckCircle2, AlertTriangle, X, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyClpKU3XANIuJepts0m_v8gRK0CRC9QGk8"

export function MapViewTab() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [sourceLocation, setSourceLocation] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [isShowingRoute, setIsShowingRoute] = useState(false)
  const [routeMarkers, setRouteMarkers] = useState<google.maps.Marker[]>([])

  // US-based MFCs (Closer together for better visualization)
  const fulfillmentCenters = [
    {
      id: 1,
      name: "Los Angeles MFC",
      type: "mfc",
      location: { lat: 36.0261, lng: -106.62185 },
      status: "overstocked",
      inventory: 2850,
      capacity: 2500,
      products: ["iPhone 15 Pro", "Samsung Galaxy S24", "MacBook Pro M3"]
    },
    {
      id: 2,
      name: "Chicago MFC",
      type: "mfc",
      location: { lat: 39.93905, lng: -91.3149 },
      status: "stable",
      inventory: 1890,
      capacity: 2200,
      products: ["Dell XPS 13", "iPad Air", "Surface Pro 9"]
    },
    {
      id: 3,
      name: "Atlanta MFC",
      type: "mfc",
      location: { lat: 35.8745, lng: -89.694 },
      status: "stockout_risk",
      inventory: 434,
      capacity: 1800,
      products: ["iPhone 15 Pro", "Samsung Galaxy S24"]
    },
    {
      id: 4,
      name: "Dallas MFC",
      type: "mfc",
      location: { lat: 35.38835, lng: -95.8985 },
      status: "stable",
      inventory: 1567,
      capacity: 2000,
      products: ["Google Pixel 8", "OnePlus 12", "Nothing Phone 2"]
    },
    {
      id: 5,
      name: "New York MFC",
      type: "mfc",
      location: { lat: 39.3564, lng: -84.503 },
      status: "stockout_risk",
      inventory: 289,
      capacity: 1500,
      products: ["MacBook Pro M3", "iPad Air"]
    }
  ]

  // Inventory Centers (Closer to MFCs)
  const inventoryCenters = [
    { 
      id: 1, 
      name: "Phoenix Inventory Hub", 
      type: "inventory", 
      status: "stable", 
      inventory: 567,
      capacity: 800,
      location: { lat: 36.5, lng: -105.0 }
    },
    { 
      id: 2, 
      name: "Seattle Inventory Hub", 
      type: "inventory", 
      status: "overstocked", 
      inventory: 923,
      capacity: 750,
      location: { lat: 40.2, lng: -92.0 }
    },
    { 
      id: 3, 
      name: "Miami Inventory Hub", 
      type: "inventory", 
      status: "stockout_risk", 
      inventory: 134,
      capacity: 600,
      location: { lat: 36.0, lng: -88.5 }
    },
    { 
      id: 4, 
      name: "Denver Inventory Hub", 
      type: "inventory", 
      status: "stable", 
      inventory: 445,
      capacity: 650,
      location: { lat: 37.0, lng: -96.0 }
    },
    { 
      id: 5, 
      name: "Boston Inventory Hub", 
      type: "inventory", 
      status: "stable", 
      inventory: 378,
      capacity: 500,
      location: { lat: 38.5, lng: -85.0 }
    }
  ]

  // US-based Stores (Adjusted to be near the closer MFCs)
  const stores = [
    { 
      id: 1, 
      name: "Store #1247", 
      type: "store", 
      status: "stable", 
      demand: "high",
      location: { lat: 36.2, lng: -106.8 }
    },
    { 
      id: 2, 
      name: "Store #1251", 
      type: "store", 
      status: "stockout_risk", 
      demand: "critical",
      location: { lat: 40.1, lng: -91.5 }
    },
    { 
      id: 3, 
      name: "Store #2101", 
      type: "store", 
      status: "overstocked", 
      demand: "low",
      location: { lat: 35.7, lng: -89.9 }
    },
    { 
      id: 4, 
      name: "Store #3021", 
      type: "store", 
      status: "stable", 
      demand: "medium",
      location: { lat: 35.2, lng: -96.1 }
    }
  ]

  // Combined locations for dropdown suggestions
  const allLocations = [
    ...fulfillmentCenters.map(fc => ({ ...fc, displayName: `${fc.name} (MFC)` })),
    ...inventoryCenters.map(ic => ({ ...ic, displayName: `${ic.name} (Inventory)` })),
    ...stores.map(s => ({ ...s, displayName: `${s.name} (Store)` }))
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overstocked': return '#ef4444' // red
      case 'stockout_risk': return '#f59e0b' // amber
      case 'stable': return '#10b981' // green
      default: return '#6b7280' // gray
    }
  }

  const getStatusColorClass = (status: string) => {
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

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 37.5, lng: -95.0 }, // Adjusted center for closer locations
      zoom: 6, // Increased zoom for better view of closer locations
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    // Initialize directions service and renderer
    const directionsServiceInstance = new google.maps.DirectionsService()
    const directionsRendererInstance = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll add custom markers
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })

    directionsRendererInstance.setMap(mapInstance)

    setMap(mapInstance)
    setDirectionsService(directionsServiceInstance)
    setDirectionsRenderer(directionsRendererInstance)
    addMarkers(mapInstance)
  }

  const addMarkers = (mapInstance: google.maps.Map) => {
    const newMarkers: google.maps.Marker[] = []

    // Add MFC markers (Red warehouse/building icons)
    fulfillmentCenters.forEach((center) => {
      const marker = new google.maps.Marker({
        position: center.location,
        map: mapInstance,
        title: center.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
              <path fill="#dc2626" stroke="#ffffff" stroke-width="2" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2z"/>
              <path fill="#dc2626" d="M12 2L2 7v2h20V7l-10-5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${center.name}</h3>
            <div style="margin: 4px 0; color: #374151;"><strong>Type:</strong> Major Fulfillment Center</div>
            <div style="margin: 4px 0; color: #374151;"><strong>Status:</strong> <span style="color: ${getStatusColor(center.status)}; font-weight: bold;">${center.status.replace('_', ' ').toUpperCase()}</span></div>
            <div style="margin: 4px 0; color: #374151;"><strong>Inventory:</strong> ${center.inventory.toLocaleString()}/${center.capacity.toLocaleString()} units</div>
            <div style="margin: 4px 0; color: #374151;"><strong>Capacity Usage:</strong> ${Math.round((center.inventory / center.capacity) * 100)}%</div>
            <div style="margin: 8px 0 4px 0; color: #374151;"><strong>Top Products:</strong></div>
            <div style="font-size: 12px; color: #6b7280;">${center.products.join(', ')}</div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push(marker)
    })

    // Add Inventory Center markers (Green warehouse icons)
    inventoryCenters.forEach((center) => {
      const marker = new google.maps.Marker({
        position: center.location,
        map: mapInstance,
        title: center.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
              <path fill="#16a34a" stroke="#ffffff" stroke-width="2" d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2z"/>
              <path fill="#16a34a" d="M12 2L2 7v2h20V7l-10-5z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 28)
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${center.name}</h3>
            <div style="margin: 4px 0; color: #374151;"><strong>Type:</strong> Inventory Distribution Hub</div>
            <div style="margin: 4px 0; color: #374151;"><strong>Status:</strong> <span style="color: ${getStatusColor(center.status)}; font-weight: bold;">${center.status.replace('_', ' ').toUpperCase()}</span></div>
            <div style="margin: 4px 0; color: #374151;"><strong>Inventory:</strong> ${center.inventory.toLocaleString()}/${center.capacity.toLocaleString()} units</div>
            <div style="margin: 4px 0; color: #374151;"><strong>Capacity Usage:</strong> ${Math.round((center.inventory / center.capacity) * 100)}%</div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push(marker)
    })

    // Add Store markers (Small circles)
    stores.forEach((store) => {
      const marker = new google.maps.Marker({
        position: store.location,
        map: mapInstance,
        title: store.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: getStatusColor(store.status),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${store.name}</h3>
            <div style="margin: 4px 0; color: #374151;"><strong>Type:</strong> Retail Store</div>
            <div style="margin: 4px 0; color: #374151;"><strong>Status:</strong> <span style="color: ${getStatusColor(store.status)}; font-weight: bold;">${store.status.replace('_', ' ').toUpperCase()}</span></div>
            <div style="margin: 4px 0; color: #374151;"><strong>Demand Level:</strong> <span style="font-weight: bold;">${store.demand.toUpperCase()}</span></div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
  }

  const handleRouteSubmit = () => {
    if (!sourceLocation || !destinationLocation || !directionsService || !directionsRenderer || !map) {
      return
    }

    // Find source and destination coordinates
    const sourceData = allLocations.find(loc => loc.displayName === sourceLocation)
    const destData = allLocations.find(loc => loc.displayName === destinationLocation)

    if (!sourceData || !destData) {
      alert('Please select valid source and destination locations')
      return
    }

    // Hide all existing markers
    markers.forEach(marker => marker.setMap(null))

    // Create route request
    const request = {
      origin: sourceData.location,
      destination: destData.location,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true
    }

    // Calculate and display route
    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result)

        // Add custom markers for source and destination
        const sourceMarker = new google.maps.Marker({
          position: sourceData.location,
          map: map,
          title: `Source: ${sourceData.name}`,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        })

        const destMarker = new google.maps.Marker({
          position: destData.location,
          map: map,
          title: `Destination: ${destData.name}`,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">D</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        })

        setRouteMarkers([sourceMarker, destMarker])
        setIsShowingRoute(true)

        // Scroll to map
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        alert('Could not calculate route. Please try different locations.')
      }
    })

    setIsRouteModalOpen(false)
  }

  const handleResetMap = () => {
    // Clear route
    directionsRenderer?.setDirections({ routes: [] } as any)
    
    // Remove route markers
    routeMarkers.forEach(marker => marker.setMap(null))
    setRouteMarkers([])
    
    // Show all original markers
    markers.forEach(marker => marker.setMap(map))
    
    setIsShowingRoute(false)
  }

  const handlePlanRoutes = () => {
    setIsRouteModalOpen(true)
    setSourceLocation("")
    setDestinationLocation("")
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

      {/* Map with Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Google Maps */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Google Maps
            </CardTitle>
            {isShowingRoute && (
              <Button 
                onClick={handleResetMap}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '400px' }}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Map shows fulfillment centers (red warehouse icons) and inventory hubs (green warehouse icons) with stores (colored circles)
            </p>
            
            {/* Status Legend */}
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-red-600 rounded-sm" />
                <span>MFC (Red)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-green-600 rounded-sm" />
                <span>Inventory Hub (Green)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Store</span>
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
                <div key={center.id} className={`p-3 rounded-lg border ${getStatusColorClass(center.status)}`}>
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
                <div key={store.id} className={`p-3 rounded-lg border ${getStatusColorClass(store.status)}`}>
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

      {/* Recommended Actions */}
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
                Atlanta MFC critically low on Samsung Galaxy S24
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
                Los Angeles MFC has excess inventory for redistribution
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
              <Button size="sm" variant="outline" className="w-full" onClick={handlePlanRoutes}>
                Plan Routes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Planning Modal */}
      <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Plan Route
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Location</label>
                <Select value={sourceLocation} onValueChange={setSourceLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map((location) => (
                      <SelectItem key={`${location.type}-${location.id}`} value={location.displayName}>
                        {location.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Location</label>
                <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLocations.map((location) => (
                      <SelectItem key={`${location.type}-${location.id}`} value={location.displayName}>
                        {location.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRouteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRouteSubmit}
                disabled={!sourceLocation || !destinationLocation}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
