import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Link } from "wouter";
import {
  Factory,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  Calendar,
  Target,
} from "lucide-react";
import type { ProductionBatch } from "@shared/schema";

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "planned": return "bg-gray-100 text-gray-800";
    case "in-progress": return "bg-blue-100 text-blue-800";
    case "qc-hold": return "bg-yellow-100 text-yellow-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
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

export default function ProductionOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [siteFilter, setSiteFilter] = useState<string>("all");

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const statusCounts = {
    planned: batches.filter(b => b.status === "planned").length,
    inProgress: batches.filter(b => b.status === "in-progress").length,
    qcHold: batches.filter(b => b.status === "qc-hold").length,
    completed: batches.filter(b => b.status === "completed").length,
  };

  const delayedBatches = batches.filter(b => b.isDelayed);
  const todaysPriorities = batches.filter(b => 
    b.priority === "critical" || b.priority === "high"
  ).slice(0, 5);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || batch.status === statusFilter;
    const matchesSite = siteFilter === "all" || batch.site === siteFilter;
    return matchesSearch && matchesStatus && matchesSite;
  });

  const sites = [...new Set(batches.map(b => b.site))];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Production Overview</h1>
                <p className="text-gray-600 mt-1">Command center for production monitoring</p>
              </div>
              <Link href="/job-scheduling">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-batch">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Schedule New Batch
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-planned">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Planned</CardTitle>
                <Calendar className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{statusCounts.planned}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting start</p>
              </CardContent>
            </Card>

            <Card data-testid="card-in-progress">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                <PlayCircle className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statusCounts.inProgress}</div>
                <p className="text-xs text-gray-500 mt-1">Currently executing</p>
              </CardContent>
            </Card>

            <Card data-testid="card-qc-hold">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">QC Hold</CardTitle>
                <PauseCircle className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{statusCounts.qcHold}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting QC clearance</p>
              </CardContent>
            </Card>

            <Card data-testid="card-completed">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{statusCounts.completed}</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Today's Priorities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Today's Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysPriorities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No high priority batches</p>
                ) : (
                  <div className="space-y-3">
                    {todaysPriorities.map(batch => (
                      <Link key={batch.id} href={`/production-workspace/${batch.id}`}>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" data-testid={`priority-batch-${batch.id}`}>
                          <div className="flex items-center gap-3">
                            <Badge className={getPriorityColor(batch.priority)}>
                              {batch.priority.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="font-semibold text-sm">{batch.batchNumber}</p>
                              <p className="text-xs text-gray-600">{batch.productName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delayed/At-Risk Batches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  At-Risk Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delayedBatches.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No delays detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {delayedBatches.slice(0, 4).map(batch => (
                      <div key={batch.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-semibold text-sm text-red-800">{batch.batchNumber}</p>
                        <p className="text-xs text-red-600 mt-1">{batch.delayReason || "Delay detected"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All Batches Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  All Active Batches
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search batches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-search-batches"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="qc-hold">QC Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={siteFilter} onValueChange={setSiteFilter}>
                    <SelectTrigger className="w-40" data-testid="select-site-filter">
                      <SelectValue placeholder="Site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map(site => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="text-center py-12">
                  <Factory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No batches found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Batch #</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Site</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stage</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Priority</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBatches.map((batch, index) => (
                        <tr key={batch.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} data-testid={`batch-row-${batch.id}`}>
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-sm">{batch.batchNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{batch.productName}</p>
                              <p className="text-xs text-gray-500">{batch.productCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{batch.site}</td>
                          <td className="px-4 py-3 text-sm">{batch.currentStage || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getPriorityColor(batch.priority)}>{batch.priority}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(batch.plannedEndDate)}</td>
                          <td className="px-4 py-3">
                            <Link href={`/production-workspace/${batch.id}`}>
                              <Button size="sm" variant="outline" data-testid={`button-view-batch-${batch.id}`}>
                                Open <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
