import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Package } from "lucide-react"

export function ForecastingTab() {
  const inventoryData = [
    {
      product: "Samsung Galaxy S24",
      sku: "SAMSUNG-S24-128",
      demand: "High",
      trend: "up",
      stock: 78,
      forecast: "+25%",
      location: "Mumbai MFC",
      status: "healthy"
    },
    {
      product: "iPhone 15 Pro",
      sku: "APPLE-15P-256",
      demand: "Critical",
      trend: "up",
      stock: 23,
      forecast: "+45%",
      location: "Delhi MFC",
      status: "critical"
    },
    {
      product: "OnePlus 12",
      sku: "ONEPLUS-12-256",
      demand: "Medium",
      trend: "down",
      stock: 65,
      forecast: "-8%",
      location: "Bangalore MFC",
      status: "warning"
    },
    {
      product: "Xiaomi 14",
      sku: "XIAOMI-14-128",
      demand: "Low",
      trend: "stable",
      stock: 89,
      forecast: "±2%",
      location: "Hyderabad MFC",
      status: "healthy"
    },
    {
      product: "Google Pixel 8",
      sku: "GOOGLE-P8-128",
      demand: "High",
      trend: "up",
      stock: 34,
      forecast: "+38%",
      location: "Chennai MFC",
      status: "warning"
    },
    {
      product: "Nothing Phone 2",
      sku: "NOTHING-P2-256",
      demand: "Medium",
      trend: "up",
      stock: 56,
      forecast: "+12%",
      location: "Pune MFC",
      status: "healthy"
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />
      default: return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'warning': return 'bg-warning text-warning-foreground'
      default: return 'bg-success text-success-foreground'
    }
  }

  const getStockColor = (stock: number) => {
    if (stock < 30) return 'bg-destructive'
    if (stock < 60) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Per-Inventory Monitoring
        </h2>
        <Badge variant="outline" className="text-sm">
          {inventoryData.length} Products Tracked
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventoryData.map((item, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.product}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {item.sku}
                  </p>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stock Level */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Stock Level</span>
                  <span className="font-medium">{item.stock}%</span>
                </div>
                <Progress 
                  value={item.stock} 
                  className="h-2"
                  style={{
                    '--progress-foreground': `hsl(var(--${getStockColor(item.stock).replace('bg-', '')}))`
                  } as React.CSSProperties}
                />
              </div>

              {/* Demand & Forecast */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Demand</span>
                    {getTrendIcon(item.trend)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.demand}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Forecast</span>
                  <div className={`text-sm font-medium ${
                    item.forecast.startsWith('+') ? 'text-success' : 
                    item.forecast.startsWith('-') ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {item.forecast}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">Location: </span>
                <span className="text-xs font-medium">{item.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}