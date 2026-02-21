import {
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@course-manager/ui";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
}

export function CourseFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: CourseFiltersProps) {
  const { t } = useTranslation("teacherCourses");

  const filterOptions = [
    { value: "all", label: t("filters.all") },
    { value: "active", label: t("filters.active") },
    { value: "draft", label: t("filters.draft") },
    { value: "archived", label: t("filters.archived") },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="h-4 w-4" />
            Filter
            {filterStatus !== "all" && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-blue-600 text-white border-0">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {filterOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={filterStatus === opt.value ? "font-medium text-blue-600" : ""}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
