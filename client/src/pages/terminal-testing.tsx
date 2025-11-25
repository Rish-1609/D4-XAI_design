import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Sidebar } from "@/components/sidebar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle,
  Search,
  Package,
  Calendar,
  AlertCircle,
  ChevronRight,
  Check,
  Clock,
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

export default function TerminalTesting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBatch, setExpandedBatch] = useState<string>("");
  const { toast } = useToast();

  const { data: batchReleases = [] } = useQuery<BatchRelease[]>({
    queryKey: ["/api/batch-releases"],
  });

  const { data: batchWorkflowSteps = [] } = useQuery<BatchWorkflowStep[]>({
    queryKey: ["/api/batch-workflow-steps/batch", expandedBatch],
    enabled: expandedBatch !== "",
  });

  // Filter batches that are released (moved to terminal testing)
  const releasedBatches = useMemo(() => {
    return batchReleases.filter(batch => batch.releaseStatus === "released");
  }, [batchReleases]);

  const filteredBatches = useMemo(() => {
    let filtered = releasedBatches;

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, releasedBatches]);

  const stats = useMemo(() => {
    const totalSteps = batchWorkflowSteps.length;
    const completedSteps = batchWorkflowSteps.filter(s => s.status === 'completed' || s.status === 'approved').length;

    return {
      totalReleased: releasedBatches.length,
      totalSteps,
      completedSteps,
    };
  }, [releasedBatches, batchWorkflowSteps]);

  // Mutation for completing steps
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      return apiRequest("PATCH", `/api/batch-workflow-steps/${stepId}`, {
        status: "completed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", expandedBatch] });
      toast({
        title: "Success",
        description: "Step marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete step",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terminal Testing</h1>
                <p className="text-gray-600 mt-1">Final batch validation and release certification</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Released Batches</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReleased}</div>
                  <p className="text-xs text-muted-foreground">Ready for terminal testing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSteps}</div>
                  <p className="text-xs text-muted-foreground">Across all batches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Steps</CardTitle>
                  <Check className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedSteps}</div>
                  <p className="text-xs text-muted-foreground">Tests completed</p>
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
                    <p className="text-gray-600">No released batches found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBatches.map((batch) => {
                  const isExpanded = expandedBatch === batch.id;

                  return (
                    <Card key={batch.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div 
                          onClick={() => setExpandedBatch(isExpanded ? "" : batch.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded">
                                <CheckCircle className="h-4 w-4 text-green-600" />
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
                            <p className="text-xs text-gray-600">Released Date</p>
                            <p className="font-semibold">{formatDate(batch.releaseDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Released By</p>
                            <p className="font-semibold text-sm">{batch.releasedBy || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Status</p>
                            <Badge className="mt-1 bg-green-600">RELEASED</Badge>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Terminal Testing Steps</h4>
                            <div className="space-y-3">
                              {batchWorkflowSteps.length === 0 ? (
                                <p className="text-sm text-gray-600">Loading steps...</p>
                              ) : (
                                batchWorkflowSteps.map((step, idx) => {
                                  const isCompleted = step.status === 'completed' || step.status === 'approved';
                                  
                                  return (
                                    <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mt-0.5 flex-shrink-0">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">{step.stepName}</p>
                                        <p className="text-xs text-gray-600">{step.stepCategory}</p>
                                        <p className="text-xs text-gray-600">Assigned to: {step.assignedTo}</p>
                                        {step.findings && <p className="text-xs text-gray-700 mt-1"><strong>Findings:</strong> {step.findings}</p>}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={isCompleted ? 'default' : 'secondary'}>
                                          {step.status.toUpperCase()}
                                        </Badge>
                                        {!isCompleted && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => completeStepMutation.mutate(step.id)}
                                            disabled={completeStepMutation.isPending}
                                          >
                                            Complete
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
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
