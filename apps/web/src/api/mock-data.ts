// Teacher schedule data
export const teacherSchedule = [
  {
    id: "1",
    courseName: "Mathematics 101: Algebra",
    type: "Lecture",
    room: "Room 304, Science Bldg",
    studentCount: 42,
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    status: "in-progress" as const,
  },
  {
    id: "2",
    courseName: "Physics 202: Mechanics",
    type: "Lab",
    room: "Lab 4, West Wing",
    studentCount: 28,
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    status: "upcoming" as const,
  },
  {
    id: "3",
    courseName: "Calculus II",
    type: "Lecture",
    room: "Room 201, Main Hall",
    studentCount: 35,
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    status: "upcoming" as const,
  },
  {
    id: "4",
    courseName: "Department Meeting",
    type: "Admin",
    room: "Conference Room A",
    studentCount: 0,
    startTime: "08:00 AM",
    endTime: "08:45 AM",
    status: "completed" as const,
  },
];

// Teacher courses
export const teacherCourses = [
  { code: "MAT101", name: "Algebra I", section: "Section A • Mon, Wed", studentCount: 42, lessonCount: 24, progress: 65 },
  { code: "PHY202", name: "Mechanics", section: "Section B • Tue, Thu", studentCount: 28, lessonCount: 18, progress: 40 },
  { code: "CAL301", name: "Advanced Calculus", section: "Section A • Mon, Fri", studentCount: 35, lessonCount: 30, progress: 85 },
  { code: "CHE102", name: "Organic Chemistry", section: "Lab Group 2 • Thu", studentCount: 20, lessonCount: 15, progress: 25 },
  { code: "HIS101", name: "World History", section: "Section C • Tue, Fri", studentCount: 50, lessonCount: 32, progress: 90 },
  { code: "CS201", name: "Data Structures", section: "Lab A • Mon, Wed", studentCount: 32, lessonCount: 28, progress: 55 },
];

// Teacher students
export const teacherStudents = [
  { id: "ST-2023-001", initials: "AJ", name: "Alice Johnson", email: "alice.j@uni.edu", courses: ["Math 101", "Physics 202"], attendance: 98, avatar: null },
  { id: "ST-2023-042", initials: "BS", name: "Bob Smith", email: "bob.smith@uni.edu", courses: ["Math 101"], attendance: 75, avatar: null },
  { id: "ST-2023-108", initials: "CW", name: "Charlie Williams", email: "c.williams@uni.edu", courses: ["Comp Sci 101", "Math 101"], attendance: 92, avatar: null },
  { id: "ST-2023-055", initials: "DP", name: "Dana Park", email: "dana.p@uni.edu", courses: ["Calculus II"], attendance: 45, avatar: null },
  { id: "ST-2023-089", initials: "EH", name: "Ethan Hunt", email: "ethan.h@uni.edu", courses: ["Physics 202", "Calculus II"], attendance: 88, avatar: null },
  { id: "ST-2023-112", initials: "FL", name: "Fiona Lee", email: "fiona.l@uni.edu", courses: ["Comp Sci 101"], attendance: 100, avatar: null },
];

// Teacher reports KPIs
export const reportKPIs = [
  { label: "Average Grade", value: "B+ (87%)", trend: { value: "+2.4%", positive: true } },
  { label: "Active Students", value: "142", trend: { value: "+12", positive: true } },
  { label: "Submission Rate", value: "94.5%", trend: { value: "0%", positive: true } },
  { label: "Feedback Pending", value: "18", trend: { value: "-5%", positive: false } },
];

// Performance data for charts
export const performanceData = [
  { subject: "Math 101", score: 87 },
  { subject: "Phys 202", score: 82 },
  { subject: "Calc II", score: 91 },
  { subject: "Chem 101", score: 78 },
  { subject: "Bio 105", score: 85 },
  { subject: "Hist 201", score: 89 },
];

// Attendance trends
export const attendanceTrends = [
  { week: "Week 1", rate: 95 },
  { week: "Week 3", rate: 92 },
  { week: "Week 5", rate: 88 },
  { week: "Week 7", rate: 90 },
  { week: "Week 9", rate: 86 },
  { week: "Week 11", rate: 84 },
];

// Generated reports
export const generatedReports = [
  { name: "Fall Midterm Analysis", date: "Oct 24, 2023", status: "Ready" },
  { name: "Student Attendance Log", date: "Oct 22, 2023", status: "Ready" },
  { name: "Department KPI Q3", date: "Oct 15, 2023", status: "Archived" },
  { name: "Course Feedback Summary", date: "Oct 10, 2023", status: "Ready" },
];

// Calendar events
export const calendarEvents: Record<number, string[]> = {
  1: ["09:00 AM - Algebra 101"],
  3: ["11:00 AM - Physics Lab"],
  8: ["09:00 AM - Algebra 101", "02:00 PM - Staff Mtg"],
  10: ["11:00 AM - Physics Lab"],
  15: ["09:00 AM - Algebra 101"],
  17: ["11:00 AM - Physics Lab"],
  22: ["09:00 AM - Algebra 101"],
  24: ["09:00 AM - Algebra 101", "11:00 AM - Physics Lab", "02:00 PM - Calculus II"],
  29: ["09:00 AM - Algebra 101"],
  31: ["11:00 AM - Physics Lab"],
};

// Upcoming deadlines
export const upcomingDeadlines = [
  { title: "Math 101 Midterm Grading", due: "Today, 5:00 PM", urgent: true },
  { title: "Submit Syllabus for Physics", due: "Tomorrow, 12:00 PM", urgent: false },
  { title: "Department Review", due: "Oct 26, 09:00 AM", urgent: false },
];

// Student schedule
export const studentSchedule = [
  {
    id: "1",
    courseName: "Algebra II",
    teacher: "Mr. Thompson",
    room: "Room 302",
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    status: "in-progress" as const,
    tag: "Material Ready",
    section: "morning",
  },
  {
    id: "2",
    courseName: "Physics Intro",
    teacher: "Ms. Rivera",
    room: "Lab B",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    status: "upcoming" as const,
    tag: "No New Feedback",
    section: "morning",
  },
  {
    id: "3",
    courseName: "English Lit",
    teacher: "Mrs. Jenkins",
    room: "Room 104",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    status: "upcoming" as const,
    tag: "Quiz Tomorrow",
    section: "afternoon",
  },
  {
    id: "4",
    courseName: "World History",
    teacher: "Mr. Davis",
    room: "Room 205",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    status: "completed" as const,
    tag: "Feedback Posted",
    section: "afternoon",
  },
];

// Student grades
export const studentGrades = {
  gpa: "3.8",
  rank: "5th",
  completion: "92%",
  courses: [
    {
      name: "Mathematics 101",
      teacher: "Mr. Anderson",
      overall: 95,
      midterm: "A (92)",
      final: "A+ (98)",
    },
    {
      name: "Advanced Physics",
      teacher: "Ms. Roberts",
      overall: 88,
      midterm: "B+ (89)",
      final: "B (87)",
    },
    {
      name: "World History",
      teacher: "Mr. Lewis",
      overall: 92,
      midterm: "A- (91)",
      final: "A (93)",
    },
  ],
  chartData: [
    { subject: "Math", you: 95, avg: 82 },
    { subject: "Sci", you: 88, avg: 80 },
    { subject: "Hist", you: 92, avg: 85 },
    { subject: "Eng", you: 87, avg: 83 },
    { subject: "Art", you: 90, avg: 78 },
  ],
};

// Student assignments
export const studentAssignments = [
  {
    id: "1",
    course: "Math 101 • Algebra",
    title: "Quadratic Equations",
    dueLabel: "Due in 2 hours",
    status: "todo" as const,
    urgent: true,
  },
  {
    id: "2",
    course: "History 204",
    title: "WWII Essay Draft",
    dueLabel: "Due Oct 12",
    status: "in-progress" as const,
    progress: 50,
    filesAttached: 2,
  },
  {
    id: "3",
    course: "Physics 101",
    title: "Lab Report: Motion",
    dueLabel: "Tomorrow, 9 AM",
    status: "todo" as const,
    description: "Complete the analysis of the pendulum experiment data collected in class on Monday.",
  },
  {
    id: "4",
    course: "Literature",
    title: "Reading Response: Hamlet",
    dueLabel: "Submitted yesterday",
    status: "completed" as const,
  },
  {
    id: "5",
    course: "CS 101",
    title: "Algorithm Complexity Quiz",
    dueLabel: "Late by 1 day",
    status: "late" as const,
  },
];

// Student resources
export const studentResources = {
  featured: [
    { title: "Advanced Calculus Notes", course: "Math 101", meta: "Added yesterday • 2.4 MB", type: "pdf" },
    { title: "Cell Structure Diagrams", course: "Biology", meta: "Added 2 days ago • 5.1 MB", type: "image" },
  ],
  all: [
    { title: "History of Modern Europe", meta: "History • PDF • 12 MB", type: "pdf" },
    { title: "Midterm Study Guide", meta: "Math • DOCX • 450 KB", type: "doc" },
    { title: "Week 5 Lecture Slides", meta: "Physics • PPTX • 8.2 MB", type: "ppt" },
    { title: "Lab Safety Protocol Video", meta: "Chemistry • MP4 • 120 MB", type: "video" },
    { title: "Hamlet - Full Text", meta: "Literature • PDF • 3.5 MB", type: "pdf" },
  ],
};

// Course feedback detail
export const courseFeedbackDetail = {
  courseName: "Advanced Mathematics 101",
  status: "Completed",
  time: "Oct 24, 2:00 PM - 3:30 PM",
  professor: "Prof. Sarah Jenkins",
  department: "Mathematics Department",
  requirements: [
    "Read Chapter 4: Quadratic Formulas",
    "Install Graphing Calculator App",
  ],
  summary: "Great participation today from everyone. We successfully covered the derivation of quadratic formulas and their real-world applications.",
  quote: "Remember to review the formula derivation and practice the examples discussed in class.",
  actionItems: [
    { title: "Complete Worksheet 4B", due: "Due Tomorrow, 9:00 AM", pending: true },
    { title: "Submit Project Proposal", due: "Due Friday, Oct 27", pending: true },
  ],
  resources: [
    { name: "Lecture_Slides_Week4.pdf", size: "2.4 MB" },
    { name: "Homework_Sheet_4B.docx", size: "856 KB" },
  ],
};
