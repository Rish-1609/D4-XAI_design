import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Settings,
  PlayCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Equipment, ProductionJob } from "@shared/schema";

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled": return "bg-blue-100 text-blue-800";
    case "in-progress": return "bg-amber-100 text-amber-800";
    case "completed": return "bg-green-100 text-green-800";
    case "on-hold": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-red-500 text-white";
    case "high": return "bg-orange-500 text-white";
    case "medium": return "bg-blue-500 text-white";
    case "low": return "bg-gray-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getWeekDates = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatWeekHeader = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export default function JobScheduling() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const weekStart = weekDates[0];

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<ProductionJob[]>({
    queryKey: ["/api/production-jobs"],
  });

  const availableEquipment = equipment.filter(e => e.status === "available");
  const scheduledJobs = jobs.filter(j => j.status === "scheduled");
  const inProgressJobs = jobs.filter(j => j.status === "in-progress");
  const completedJobs = jobs.filter(j => j.status === "completed");

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getJobsForEquipmentAndDay = (equipmentId: string, date: Date) => {
    return jobs.filter(job => {
      if (job.equipmentId !== equipmentId) return false;
      const jobStart = new Date(job.scheduledStart);
      const jobEnd = new Date(job.scheduledEnd);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      return jobStart <= dayEnd && jobEnd >= dayStart;
    });
  };

  const getEquipmentById = (id: string) => {
    return equipment.find(e => e.id === id);
  };

  const isLoading = equipmentLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Job Scheduling</h1>
              <p className="text-gray-500">Schedule and manage production jobs across equipment</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={goToToday} data-testid="button-today">
                Today
              </Button>
              <div className="flex items-center gap-1 bg-white border rounded-lg px-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousWeek} data-testid="button-prev-week">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-2 font-medium text-sm" data-testid="text-week-range">
                  Week of {formatWeekHeader(weekStart)}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextWeek} data-testid="button-next-week">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card data-testid="card-scheduled-jobs">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Jobs</p>
                    <p className="text-2xl font-bold" data-testid="text-scheduled-count">{scheduledJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-available-equipment">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Equipment</p>
                    <p className="text-2xl font-bold" data-testid="text-available-count">{availableEquipment.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-in-progress">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <PlayCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold" data-testid="text-in-progress-count">{inProgressJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-completed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold" data-testid="text-completed-count">{completedJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6" data-testid="card-gantt-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Production Gantt Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="font-medium text-sm text-gray-500 p-2">Equipment</div>
                    {weekDates.map((date, idx) => (
                      <div 
                        key={idx} 
                        className={`text-center text-sm font-medium p-2 rounded ${
                          date.toDateString() === new Date().toDateString() 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'text-gray-600'
                        }`}
                      >
                        <div>{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                        <div className="text-lg">{date.getDate()}</div>
                      </div>
                    ))}
                  </div>
                  
                  {equipment.map(eq => (
                    <div 
                      key={eq.id} 
                      className="grid grid-cols-8 gap-1 border-t py-2"
                      data-testid={`row-equipment-${eq.id}`}
                    >
                      <div className="flex items-center gap-2 p-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{eq.name}</div>
                          <div className="text-xs text-gray-500">{eq.code}</div>
                        </div>
                      </div>
                      {weekDates.map((date, idx) => {
                        const dayJobs = getJobsForEquipmentAndDay(eq.id, date);
                        return (
                          <div 
                            key={idx} 
                            className={`min-h-[60px] border rounded p-1 ${
                              date.toDateString() === new Date().toDateString() 
                                ? 'bg-blue-50' 
                                : 'bg-gray-50'
                            }`}
                          >
                            {dayJobs.map(job => (
                              <div
                                key={job.id}
                                className={`text-xs p-1 rounded mb-1 ${getStatusColor(job.status)}`}
                                title={`${job.productName} - ${job.jobNumber}`}
                                data-testid={`gantt-job-${job.id}`}
                              >
                                <div className="font-medium truncate">{job.productName}</div>
                                <div className="text-[10px] opacity-75">{job.jobNumber}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-jobs-table">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                All Scheduled Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Number</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No production jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map(job => {
                      const eq = getEquipmentById(job.equipmentId || "");
                      return (
                        <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                          <TableCell className="font-medium">{job.jobNumber}</TableCell>
                          <TableCell>{job.orderNumber || "—"}</TableCell>
                          <TableCell>{job.productName}</TableCell>
                          <TableCell>{eq?.name || "—"}</TableCell>
                          <TableCell>{formatDate(job.scheduledStart)}</TableCell>
                          <TableCell>{job.durationMinutes ? `${Math.round(job.durationMinutes / 60)}h` : "—"}</TableCell>
                          <TableCell>{job.quantity?.toLocaleString() || "—"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(job.priority || "medium")}>
                              {job.priority || "medium"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
