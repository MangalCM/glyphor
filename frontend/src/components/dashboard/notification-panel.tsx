import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, X } from "lucide-react"

interface Notification {
  id: number
  message: string
  type: 'spike' | 'critical' | 'info'
  timestamp: Date
}

interface NotificationPanelProps {
  muted: boolean
}

export function NotificationPanel({ muted }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([])

  // Simulate real-time notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        message: "Demand spike detected in Hyderabad MFC - Samsung Galaxy S24",
        type: 'spike' as const,
        timestamp: new Date()
      },
      {
        id: 2, 
        message: "Critical stock level reached in Bangalore MFC",
        type: 'critical' as const,
        timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      }
    ]

    setNotifications(mockNotifications)

    // Simulate new notifications coming in
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now(),
        message: `New alert: Stock rebalancing needed in ${['Mumbai', 'Delhi', 'Chennai'][Math.floor(Math.random() * 3)]} MFC`,
        type: Math.random() > 0.5 ? 'spike' : 'critical',
        timestamp: new Date()
      }
      
      setNotificationQueue(prev => [newNotification, ...prev])
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Handle notification queue and display logic
  useEffect(() => {
    if (muted || notificationQueue.length === 0) return

    // Show up to 3 notifications, with newest first
    const visibleNotifications = notificationQueue.slice(0, 3)
    setNotifications(visibleNotifications)
  }, [notificationQueue, muted])

  // Clear notifications when muted
  useEffect(() => {
    if (muted) {
      setNotifications([])
    }
  }, [muted])

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setNotificationQueue(prev => prev.filter(n => n.id !== id))
  }

  const markAsCritical = (id: number) => {
    console.log(`Marking notification ${id} as critical`)
    // In a real app, this would trigger some backend action
    dismissNotification(id)
  }

  if (muted || notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md max-h-[calc(100vh-2rem)] overflow-hidden">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className="bg-background/50 backdrop-blur-sm border shadow-lg transition-all duration-300 ease-in-out animate-slide-in-right"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className={`h-4 w-4 ${
                  notification.type === 'critical' ? 'text-destructive' : 
                  notification.type === 'spike' ? 'text-warning' : 'text-primary'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => dismissNotification(notification.id)}
              >
                Ignore
              </Button>
              <Button
                size="sm"
                className="text-xs h-7 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => markAsCritical(notification.id)}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Mark as Critical
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}