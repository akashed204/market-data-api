import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-terminal-line bg-slate-950/50 px-3 py-2 text-sm text-terminal-text shadow-sm outline-none transition-colors placeholder:text-terminal-muted focus:border-terminal-cyan focus:ring-2 focus:ring-terminal-cyan/20 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
