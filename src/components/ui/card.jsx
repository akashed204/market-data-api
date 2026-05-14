import { cn } from "../../lib/utils"

function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-[12px] border border-terminal-line bg-terminal-panel shadow-terminal", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-base font-semibold text-terminal-text", className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-terminal-muted", className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
