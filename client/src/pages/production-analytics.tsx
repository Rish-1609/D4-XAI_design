import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Package,
  Factory,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { ProductionBatch } from "@shared/schema";

export default function ProductionAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [siteFilter, setSiteFilter] = useState("all");

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  // Calculate analytics
  const completedBatches = batches.filter(b => b.status === "completed");
  const inProgressBatches = batches.filter(b => b.status === "in-progress");
  const plannedBatches = batches.filter(b => b.status === "planned");
  const delayedBatches = batches.filter(b => b.isDelayed);

  const avgYield = completedBatches.length > 0
    ? completedBatches.reduce((sum, b) => sum + (parseFloat(b.yieldPercentage?.toString() || "0")), 0) / completedBatches.length
    : 0;

  const totalScrap = batches.reduce((sum, b) => sum + (b.scrapQuantity || 0), 0);
  const totalRework = batches.reduce((sum, b) => sum + (b.reworkQuantity || 0), 0);

  const sites = [...new Set(batches.map(b => b.site))];

  // Plan vs Actual calculations
  const onTimeCompletion = completedBatches.filter(b => {
    if (!b.plannedEndDate || !b.actualEndDate) return false;
    return new Date(b.actualEndDate) <= new Date(b.plannedEndDate);
  }).length;

  const onTimeRate = completedBatches.length > 0 
    ? (onTimeCompletion / completedBatches.length * 100).toFixed(1)
    : 0;

  // Cycle time analysis (mock data for visualization)
  const avgCycleTime = 48; // hours
  const targetCycleTime = 40; // hours

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Production Analytics</h1>
                <p className="text-gray-600 mt-1">Performance insights and trends</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-36" data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="ytd">Year to date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger className="w-36" data-testid="select-site">
                    <SelectValue />
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
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
                    <Package className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{batches.length}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">{completedBatches.length} completed</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Yield</CardTitle>
                    <Target className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{avgYield.toFixed(1)}%</div>
                    <div className="flex items-center gap-1 mt-1">
                      {avgYield >= 95 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">Target: 95%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">On-Time Rate</CardTitle>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{onTimeRate}%</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">{onTimeCompletion} of {completedBatches.length} on time</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Delayed Batches</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{delayedBatches.length}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">Requires attention</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Plan vs Actual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Plan vs Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Planned Batches</span>
                        <span className="font-semibold">{plannedBatches.length + inProgressBatches.length + completedBatches.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${completedBatches.length > 0 ? (completedBatches.length / (plannedBatches.length + inProgressBatches.length + completedBatches.length) * 100) : 0}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-gray-600">{plannedBatches.length}</p>
                          <p className="text-xs text-gray-500">Planned</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-blue-600">{inProgressBatches.length}</p>
                          <p className="text-xs text-gray-500">In Progress</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-green-600">{completedBatches.length}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cycle Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Cycle Time Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average Cycle Time</span>
                        <span className={`font-semibold ${avgCycleTime > targetCycleTime ? "text-red-600" : "text-green-600"}`}>
                          {avgCycleTime} hours
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 relative">
                        <div className={`h-3 rounded-full ${avgCycleTime > targetCycleTime ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min((avgCycleTime / 60) * 100, 100)}%` }} />
                        <div className="absolute top-0 h-3 w-1 bg-gray-800" style={{ left: `${(targetCycleTime / 60) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0h</span>
                        <span>Target: {targetCycleTime}h</span>
                        <span>60h</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-sm">
                          {avgCycleTime > targetCycleTime ? (
                            <span className="flex items-center gap-2 text-red-700">
                              <TrendingDown className="h-4 w-4" />
                              {(avgCycleTime - targetCycleTime).toFixed(1)} hours above target
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-green-700">
                              <TrendingUp className="h-4 w-4" />
                              {(targetCycleTime - avgCycleTime).toFixed(1)} hours below target
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Yield & Scrap Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Yield Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">≥98% (Excellent)</span>
                        <span className="font-semibold text-green-600">{completedBatches.filter(b => parseFloat(b.yieldPercentage?.toString() || "0") >= 98).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">95-98% (Good)</span>
                        <span className="font-semibold text-blue-600">{completedBatches.filter(b => {
                          const y = parseFloat(b.yieldPercentage?.toString() || "0");
                          return y >= 95 && y < 98;
                        }).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">90-95% (Acceptable)</span>
                        <span className="font-semibold text-yellow-600">{completedBatches.filter(b => {
                          const y = parseFloat(b.yieldPercentage?.toString() || "0");
                          return y >= 90 && y < 95;
                        }).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">&lt;90% (Below Target)</span>
                        <span className="font-semibold text-red-600">{completedBatches.filter(b => parseFloat(b.yieldPercentage?.toString() || "0") < 90).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scrap & Rework</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Total Scrap</span>
                          <span className="font-semibold text-red-600">{totalScrap.toLocaleString()} units</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min((totalScrap / 10000) * 100, 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Total Rework</span>
                          <span className="font-semibold text-amber-600">{totalRework.toLocaleString()} units</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((totalRework / 10000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Site Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sites.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No site data available</p>
                      ) : (
                        sites.map(site => {
                          const siteBatches = batches.filter(b => b.site === site);
                          const siteCompleted = siteBatches.filter(b => b.status === "completed").length;
                          return (
                            <div key={site} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Factory className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">{site}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold">{siteBatches.length} batches</span>
                                <span className="text-xs text-gray-500 block">{siteCompleted} completed</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Resource Utilization Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">78%</p>
                      <p className="text-sm text-gray-600 mt-1">Equipment Utilization</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">92%</p>
                      <p className="text-sm text-gray-600 mt-1">Material Efficiency</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">85%</p>
                      <p className="text-sm text-gray-600 mt-1">Labor Productivity</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <p className="text-3xl font-bold text-amber-600">88%</p>
                      <p className="text-sm text-gray-600 mt-1">Overall OEE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
