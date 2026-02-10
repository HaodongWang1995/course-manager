import { cn } from "../lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface KpiCardTrend {
  value: string;
  positive: boolean;
}

export interface KpiCardProps {
  value: string;
  label: string;
  trend?: KpiCardTrend;
  className?: string;
}

export function KpiCard({ value, label, trend, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
