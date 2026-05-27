import * as React from "react";
import { cn } from "@job-portal/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizes = {
    sm: "size-4 border-2",
    md: "size-6 border-2",
    lg: "size-8 border-[3px]",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Spinner };
