import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationPanelProps {
  muted: boolean
}

export function NotificationPanel({ muted }: NotificationPanelProps) {
  const [visibleToasts, setVisibleToasts] = useState<string[]>([])
  const { notifications, markAsRead } = useNotifications()

  // Show new notifications as toasts when they arrive
  useEffect(() => {
    if (muted) return

    const unreadNotifications = notifications.filter(n => !n.read && !visibleToasts.includes(n.id))
    
    unreadNotifications.forEach((notification) => {
      if (visibleToasts.length < 3) { // Limit to 3 visible toasts
        setVisibleToasts(prev => [...prev, notification.id])
        
        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(id => id !== notification.id))
        }, 5000)
      }
    })
  }, [notifications, muted, visibleToasts])

  const dismissToast = (notificationId: string) => {
    setVisibleToasts(prev => prev.filter(id => id !== notificationId))
    markAsRead(notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20'
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
    }
  }

  if (muted) return null

  const toastNotifications = notifications.filter(n => visibleToasts.includes(n.id))

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toastNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className={`border-l-4 ${getNotificationStyle(notification.type)} shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  {notification.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissToast(notification.id)}
                className="h-6 w-6 p-0 hover:bg-background/80"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
