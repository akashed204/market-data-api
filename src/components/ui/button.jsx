import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terminal-teal disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-terminal-teal text-slate-950 font-bold hover:bg-emerald-300",
        destructive: "bg-terminal-red/90 text-white hover:bg-terminal-red",
        outline: "border border-terminal-line bg-slate-950/30 text-terminal-text hover:bg-slate-800",
        ghost: "text-terminal-muted hover:bg-slate-800/70 hover:text-terminal-text",
        secondary: "bg-slate-800 text-terminal-text hover:bg-slate-700",
        destructive_gray: "bg-terminal-line text-slate-400 hover:bg-slate-700/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button }
