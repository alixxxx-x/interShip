import * as React from "react"
import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const Stepper = ({ steps, currentStep, status }) => {
  return (
    <div className="flex items-center w-full min-w-[140px] max-w-[200px] space-x-1.5 pb-4 pt-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep - 1;
        const isCurrent = index === currentStep - 1;
        const isRejected = status === "REJECTED";

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center relative group">
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? isRejected 
                      ? "bg-destructive border-destructive text-destructive-foreground"
                      : "bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    : "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  isRejected ? (
                    <X className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )
                ) : (
                  <span className="text-[9px]">{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap",
                  isCurrent 
                    ? (isRejected ? "text-destructive" : "text-orange-500 font-semibold") 
                    : "text-muted-foreground opacity-70"
                )}
              >
                {isRejected && isCurrent ? "Rejected" : step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] min-w-[16px] transition-all duration-500",
                  index < currentStep - 1 ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export { Stepper }
