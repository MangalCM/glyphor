import { Home, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import walmartLogo from "@/assets/walmart-logo.png"

interface NavbarProps {
  notificationsMuted: boolean
  onToggleNotifications: () => void
}

export function Navbar({ notificationsMuted, onToggleNotifications }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={walmartLogo} 
            alt="Walmart" 
            className="h-8 w-auto brightness-0 invert"
          />
          <span className="text-lg font-semibold text-primary-foreground">
            Inventory Dashboard
          </span>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/20 gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNotifications}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {notificationsMuted ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}