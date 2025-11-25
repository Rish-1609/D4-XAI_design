import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import {
  Clock,
  Search,
  Eye,
  Package,
  Calendar,
  Users,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { BatchRelease, BatchWorkflowStep } from "@shared/schema";

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function StabilityTesting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBatch, setExpandedBatch] = useState<string>("");

  const { data: batchReleases = [] } = useQuery<BatchRelease[]>({
    queryKey: ["/api/batch-releases"],
  });

  const { data: batchWorkflowSteps = [] } = useQuery<BatchWorkflowStep[]>({
    queryKey: ["/api/batch-workflow-steps/batch", expandedBatch],
    enabled: expandedBatch !== "",
  });

  // Filter batches that are in under-testing status (in-process batches)
  const inProcessBatches = useMemo(() => {
    return batchReleases.filter(batch => batch.releaseStatus === "under-testing");
  }, [batchReleases]);

  const filteredBatches = useMemo(() => {
    let filtered = inProcessBatches;

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, inProcessBatches]);

  const stats = useMemo(() => {
    return {
      total: inProcessBatches.length,
      pending: inProcessBatches.filter(b => b.releaseStatus === "under-testing").length,
    };
  }, [inProcessBatches]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Stability Testing</h1>
                <p className="text-gray-600 mt-1">In-process batch testing and monitoring</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">In stability testing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Under Testing</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting completion</p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search batches, products, or order numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Batches List */}
            <div className="space-y-4">
              {filteredBatches.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No in-process batches found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpanded = expandedBatch === batch.id;
                  const completedSteps = batchWorkflowSteps.filter(s => s.status === 'completed').length;
                  const totalSteps = batchWorkflowSteps.length;
                  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                  return (
                    <Card key={batch.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div 
                          onClick={() => setExpandedBatch(isExpanded ? "" : batch.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded">
                                <Package className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{batch.batchNumber}</h3>
                                <p className="text-sm text-gray-600">{batch.productName} | {batch.productCode}</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4 ml-11">
                          <div>
                            <p className="text-xs text-gray-600">Batch Size</p>
                            <p className="font-semibold">{batch.batchSize.toLocaleString()} units</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Manufacturing Date</p>
                            <p className="font-semibold">{formatDate(batch.manufacturedDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Status</p>
                            <Badge className="mt-1">IN TESTING</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Progress</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={progress} className="flex-1" />
                              <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Workflow Steps</h4>
                            <div className="space-y-2">
                              {batchWorkflowSteps.length === 0 ? (
                                <p className="text-sm text-gray-600">Loading steps...</p>
                              ) : (
                                batchWorkflowSteps.map((step, idx) => (
                                  <div key={step.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">{step.stepName}</p>
                                      <p className="text-xs text-gray-600">{step.stepCategory}</p>
                                      <p className="text-xs text-gray-600">Assigned to: {step.assignedTo}</p>
                                    </div>
                                    <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                                      {step.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
