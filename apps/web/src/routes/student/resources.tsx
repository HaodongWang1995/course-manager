import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, Badge } from "@course-manager/ui";
import {
  Search,
  FileText,
  FileImage,
  FileVideo,
  File,
  Download,
  BookOpen,
  Star,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/student/resources")({
  component: StudentResources,
});

const filterChips = [
  { label: "All", active: true },
  { label: "Math", active: false },
  { label: "Science", active: false },
  { label: "Literature", active: false },
  { label: "History", active: false },
  { label: "Physics", active: false },
];

const featuredResources = [
  {
    id: "calc-notes",
    title: "Advanced Calculus Notes",
    subtitle: "Math 101",
    description: "Comprehensive notes covering limits, derivatives, and integrals with worked examples.",
    icon: "math",
    bgColor: "bg-blue-600",
    downloads: 234,
    rating: 4.8,
  },
  {
    id: "bio-diagrams",
    title: "Cell Structure Diagrams",
    subtitle: "Biology",
    description: "Detailed diagrams of plant and animal cells with labeled organelles.",
    icon: "science",
    bgColor: "bg-emerald-600",
    downloads: 189,
    rating: 4.6,
  },
];

const allResources = [
  {
    id: "hist-europe",
    title: "History of Modern Europe",
    type: "PDF",
    size: "12MB",
    course: "History 204",
    date: "Oct 20, 2023",
    icon: FileText,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    id: "midterm-guide",
    title: "Midterm Study Guide",
    type: "DOCX",
    size: "450KB",
    course: "Math 101",
    date: "Oct 18, 2023",
    icon: FileText,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: "lecture-slides",
    title: "Week 5 Lecture Slides",
    type: "PPTX",
    size: "8.2MB",
    course: "Physics 101",
    date: "Oct 17, 2023",
    icon: File,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    id: "lab-safety",
    title: "Lab Safety Protocol Video",
    type: "MP4",
    size: "120MB",
    course: "Chemistry",
    date: "Oct 15, 2023",
    icon: FileVideo,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
  },
  {
    id: "hamlet-text",
    title: "Hamlet Full Text",
    type: "PDF",
    size: "3.5MB",
    course: "Literature",
    date: "Oct 12, 2023",
    icon: BookOpen,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
  },
];

function StudentResources() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <p className="mt-0.5 text-sm text-gray-500">Browse and download course materials</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources, files..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Filter Chips - Horizontal scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filterChips.map((chip) => (
          <button
            key={chip.label}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              chip.active
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Featured / Recent Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Featured
          </h2>
          <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              {/* Colored banner */}
              <div className={`${resource.bgColor} px-4 py-5`}>
                <div className="flex items-center gap-2">
                  {resource.icon === "math" ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <span className="text-lg font-bold text-white">f(x)</span>
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <FileImage className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {resource.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{resource.subtitle}</p>
                <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Download className="h-3 w-3" />
                    <span>{resource.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span className="font-medium">{resource.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* All Resources List */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            All Resources
          </h2>
          <span className="text-xs text-gray-400">{allResources.length} files</span>
        </div>
        <div className="space-y-2">
          {allResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  {/* File type icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${resource.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${resource.iconColor}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {resource.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-500">{resource.type}</span>
                      <span>{resource.size}</span>
                      <span className="text-gray-300">|</span>
                      <span>{resource.course}</span>
                      <span className="text-gray-300">|</span>
                      <span>{resource.date}</span>
                    </div>
                  </div>

                  {/* Download */}
                  <button className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
