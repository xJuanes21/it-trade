import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, type, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-input px-4 py-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            Icon && iconPosition === "left" && "pl-11",
            Icon && iconPosition === "right" && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <Icon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
