import { Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export function StatCard({ label, value, color = "text-gray-900" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
