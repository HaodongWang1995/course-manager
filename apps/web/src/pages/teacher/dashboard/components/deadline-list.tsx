import { Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";

const deadlineColors = [
  "border-l-red-500",
  "border-l-amber-400",
  "border-l-blue-500",
  "border-l-green-500",
];

interface Deadline {
  id?: string | number;
  title: string;
  due_date: string;
  urgent?: boolean;
}

interface DeadlineListProps {
  deadlines: Deadline[];
}

export function DeadlineList({ deadlines }: DeadlineListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
          <button className="text-xs font-medium text-blue-600 hover:underline">View All</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deadlines.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No upcoming deadlines</p>
        ) : (
          deadlines.map((item, idx) => {
            const colorClass = deadlineColors[idx % deadlineColors.length];
            return (
              <div
                key={item.id ?? idx}
                className={`rounded-lg border-l-4 bg-white px-3 py-2.5 shadow-sm ${colorClass}`}
              >
                <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(item.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
