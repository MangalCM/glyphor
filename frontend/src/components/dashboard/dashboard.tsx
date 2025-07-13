import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Navbar } from "./navbar"
import { HeadlineTab } from "./headline-tab"
import { ForecastingTab } from "./forecasting-tab"
import { SpikeMonitoringTab } from "./spike-monitoring-tab"
import { MapViewTab } from "./map-view-tab"
import { NotificationPanel } from "./notification-panel"
import { ExcelUpload } from "./excel-upload"
import { Newspaper, TrendingUp, AlertTriangle, Map } from "lucide-react"

export function Dashboard() {
  const [notificationsMuted, setNotificationsMuted] = useState(false)

  const toggleNotifications = () => {
    setNotificationsMuted(!notificationsMuted)
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        notificationsMuted={notificationsMuted}
        onToggleNotifications={toggleNotifications}
      />
      
      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header with Upload */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                GLYPHOR Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time inventory redistribution and demand monitoring
              </p>
            </div>
            <ExcelUpload />
          </div>

          {/* Main Tabs */}
          <Card className="border-0 shadow-lg">
            <Tabs defaultValue="headline" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 h-auto">
                <TabsTrigger 
                  value="headline" 
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Newspaper className="h-4 w-4" />
                  <span className="hidden sm:inline">Headline</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="forecasting"
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Forecasting</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="spike-monitoring"
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Spike Monitoring</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="map-view"
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Map View</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="headline" className="mt-0">
                <HeadlineTab />
              </TabsContent>

              <TabsContent value="forecasting" className="mt-0">
                <ForecastingTab />
              </TabsContent>

              <TabsContent value="spike-monitoring" className="mt-0">
                <SpikeMonitoringTab />
              </TabsContent>

              <TabsContent value="map-view" className="mt-0">
                <MapViewTab />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>

      {/* Floating Notifications */}
      <NotificationPanel muted={notificationsMuted} />
    </div>
  )
}