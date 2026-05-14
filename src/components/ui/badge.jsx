import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "border border-terminal-teal/30 bg-terminal-teal/15 text-terminal-teal",
        secondary: "border border-terminal-line bg-slate-800/80 text-terminal-muted",
        warning: "border border-terminal-amber/30 bg-terminal-amber/15 text-terminal-amber",
        destructive: "border border-terminal-red/30 bg-terminal-red/15 text-terminal-red",
        info: "border border-terminal-cyan/30 bg-terminal-cyan/15 text-terminal-cyan",
        exchange: "border border-terminal-blue/30 bg-terminal-blue/15 text-terminal-blue",
        instrument: "border border-terminal-teal/30 bg-terminal-teal/15 text-terminal-teal",
        token: "border border-terminal-purple/30 bg-terminal-purple/15 text-terminal-purple",
        subscribed: "border border-dashed border-terminal-teal/60 bg-terminal-teal/5 text-terminal-teal shadow-teal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge }
