"use client";

import { cn } from "../lib/utils";
import { Clock, MapPin, User, ClipboardList, MessageSquare } from "lucide-react";

export type ScheduleStatus = "in-progress" | "upcoming" | "completed";

export interface ScheduleCardProps {
  courseName: string;
  teacher?: string;
  room?: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  onRequirements?: () => void;
  onFeedback?: () => void;
  className?: string;
}

const statusConfig: Record<
  ScheduleStatus,
  { label: string; className: string }
> = {
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

export function ScheduleCard({
  courseName,
  teacher,
  room,
  startTime,
  endTime,
  status,
  onRequirements,
  onFeedback,
  className,
}: ScheduleCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      {/* Header: course name + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{courseName}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            statusInfo.className
          )}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        {teacher && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{teacher}</span>
          </div>
        )}
        {room && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{room}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
          <span>
            {startTime} - {endTime}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {(onRequirements || onFeedback) && (
        <div className="mt-4 flex items-center gap-2">
          {onRequirements && (
            <button
              type="button"
              onClick={onRequirements}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Requirements
            </button>
          )}
          {onFeedback && (
            <button
              type="button"
              onClick={onFeedback}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Feedback
            </button>
          )}
        </div>
      )}
    </div>
  );
}
