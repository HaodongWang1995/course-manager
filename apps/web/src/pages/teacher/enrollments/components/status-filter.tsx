const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

interface StatusFilterProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function StatusFilter({ statusFilter, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onStatusChange(tab.value)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            statusFilter === tab.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
