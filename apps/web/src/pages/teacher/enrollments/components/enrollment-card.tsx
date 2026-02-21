import { Card, CardContent, Badge, Button, Avatar, AvatarFallback } from "@course-manager/ui";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { Enrollment } from "@/api/client";

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

interface EnrollmentCardProps {
  enrollment: Enrollment;
  rejectingId: string | null;
  rejectReason: string;
  isPending: boolean;
  onApprove: (id: string) => void;
  onStartReject: (id: string) => void;
  onConfirmReject: (id: string) => void;
  onCancelReject: () => void;
  onRejectReasonChange: (reason: string) => void;
}

export function EnrollmentCard({
  enrollment,
  rejectingId,
  rejectReason,
  isPending,
  onApprove,
  onStartReject,
  onConfirmReject,
  onCancelReject,
  onRejectReasonChange,
}: EnrollmentCardProps) {
  const config = statusConfig[enrollment.status];
  const StatusIcon = config.icon;
  const initials = (enrollment.student_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-blue-500 text-xs font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {enrollment.student_name}
              </h3>
              <Badge variant={config.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{enrollment.student_email}</p>
            {enrollment.note && (
              <p className="mt-1 text-sm text-gray-600">&quot;{enrollment.note}&quot;</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Applied: {new Date(enrollment.created_at).toLocaleDateString()}
            </p>

            {/* Reject reason input */}
            {rejectingId === enrollment.id && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onConfirmReject(enrollment.id)}
                  disabled={isPending}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelReject}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {enrollment.status === "pending" && rejectingId !== enrollment.id && (
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(enrollment.id)}
                disabled={isPending}
                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartReject(enrollment.id)}
                className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
