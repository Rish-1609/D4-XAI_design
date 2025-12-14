import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Factory,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Package,
  Beaker,
  Box,
  Plus,
  Save,
  ArrowRight,
  User,
  Calendar,
  Target,
  Loader2,
  FileText,
  MessageSquare,
} from "lucide-react";
import type { ProductionBatch, BatchStage, BatchExecution } from "@shared/schema";

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getStageIcon = (stageName: string) => {
  switch (stageName.toLowerCase()) {
    case "dispensing": return Package;
    case "manufacturing": return Factory;
    case "packing": return Box;
    default: return Beaker;
  }
};

const getStageStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500";
    case "in-progress": return "bg-blue-500";
    case "on-hold": return "bg-yellow-500";
    default: return "bg-gray-300";
  }
};

export default function ProductionWorkspace() {
  const [, params] = useRoute("/production-workspace/:id");
  const batchId = params?.id;
  const [activeTab, setActiveTab] = useState("stages");
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [executionType, setExecutionType] = useState("material-consumption");
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const { toast } = useToast();

  const { data: batch, isLoading: batchLoading } = useQuery<ProductionBatch>({
    queryKey: ["/api/production-batches", batchId],
    enabled: !!batchId,
  });

  const { data: stages = [] } = useQuery<BatchStage[]>({
    queryKey: ["/api/batch-stages", batchId],
    enabled: !!batchId,
  });

  const { data: executions = [] } = useQuery<BatchExecution[]>({
    queryKey: ["/api/batch-executions", batchId],
    enabled: !!batchId,
  });

  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
  }, [stages]);

  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status }: { stageId: string; status: string }) => {
      return apiRequest("PATCH", `/api/batch-stages/${stageId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-stages", batchId] });
      toast({ title: "Stage updated", description: "Stage status has been updated" });
    },
  });

  const createExecutionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/batch-executions", {
        ...data,
        batchId,
        stageId: selectedStageId || undefined,
        recordedBy: "Current User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-executions", batchId] });
      setExecutionDialogOpen(false);
      toast({ title: "Record added", description: "Execution record has been saved" });
    },
  });

  const handleStartStage = (stageId: string) => {
    updateStageMutation.mutate({ stageId, status: "in-progress" });
  };

  const handleCompleteStage = (stageId: string) => {
    updateStageMutation.mutate({ stageId, status: "completed" });
  };

  if (batchLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Batch not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Batch Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">{batch.batchNumber}</h1>
                    <Badge className={batch.status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                      {batch.status}
                    </Badge>
                    <Badge className={batch.priority === "critical" ? "bg-red-500 text-white" : batch.priority === "high" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}>
                      {batch.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{batch.productName} ({batch.productCode})</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Target Quantity</p>
                  <p className="font-semibold">{batch.targetQuantity?.toLocaleString()} {batch.uom}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Current Stage</p>
                  <p className="font-semibold">{batch.currentStage || "Not Started"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stage Flow - Center Panel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Stage Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedStages.length === 0 ? (
                    <div className="text-center py-8">
                      <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No stages configured for this batch</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedStages.map((stage, index) => {
                        const StageIcon = getStageIcon(stage.stageName);
                        return (
                          <div key={stage.id} className="relative">
                            {index < sortedStages.length - 1 && (
                              <div className="absolute left-6 top-14 w-0.5 h-8 bg-gray-200" />
                            )}
                            <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                              stage.status === "in-progress" ? "border-blue-300 bg-blue-50" :
                              stage.status === "completed" ? "border-green-300 bg-green-50" :
                              "border-gray-200 bg-white"
                            }`} data-testid={`stage-${stage.id}`}>
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getStageStatusColor(stage.status)}`}>
                                <StageIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{stage.stageName}</h3>
                                    <p className="text-sm text-gray-600">Stage {stage.stageOrder}</p>
                                  </div>
                                  <Badge className={
                                    stage.status === "completed" ? "bg-green-100 text-green-800" :
                                    stage.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                                    stage.status === "on-hold" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-gray-100 text-gray-800"
                                  }>
                                    {stage.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{stage.operatorName || "Unassigned"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {stage.startTime ? formatDate(stage.startTime) : "Not started"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {stage.qcCheckpointCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <span className="text-gray-600">
                                      QC: {stage.qcCheckpointResult || "Pending"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  {stage.status === "not-started" && (
                                    <Button size="sm" onClick={() => handleStartStage(stage.id)} data-testid={`button-start-stage-${stage.id}`}>
                                      <PlayCircle className="h-4 w-4 mr-1" /> Start
                                    </Button>
                                  )}
                                  {stage.status === "in-progress" && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => {
                                        setSelectedStageId(stage.id);
                                        setExecutionDialogOpen(true);
                                      }} data-testid={`button-record-stage-${stage.id}`}>
                                        <Plus className="h-4 w-4 mr-1" /> Record
                                      </Button>
                                      <Button size="sm" onClick={() => handleCompleteStage(stage.id)} data-testid={`button-complete-stage-${stage.id}`}>
                                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Log */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Execution Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {executions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No execution records yet</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {executions.map(exec => (
                        <div key={exec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-testid={`execution-${exec.id}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            exec.executionType === "deviation" ? "bg-red-100" :
                            exec.executionType === "material-consumption" ? "bg-blue-100" :
                            "bg-green-100"
                          }`}>
                            {exec.executionType === "deviation" ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                             exec.executionType === "material-consumption" ? <Package className="h-4 w-4 text-blue-600" /> :
                             <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{exec.executionType.replace("-", " ")}</p>
                            <p className="text-xs text-gray-600">
                              {exec.materialName && `${exec.materialName}: ${exec.quantityUsed} ${exec.uom}`}
                              {exec.comment && exec.comment}
                              {exec.deviationDescription && exec.deviationDescription}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">By {exec.recordedBy} at {formatDate(exec.recordedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Batch Info & Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Site</p>
                      <p className="font-medium">{batch.site}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="font-medium">{batch.assignedTo || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Planned Start</p>
                      <p className="font-medium">{formatDate(batch.plannedStartDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Planned End</p>
                      <p className="font-medium">{formatDate(batch.plannedEndDate)}</p>
                    </div>
                  </div>
                  {batch.yieldPercentage && (
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500">Yield</p>
                      <p className="text-2xl font-bold text-green-600">{batch.yieldPercentage}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => {
                    setExecutionType("material-consumption");
                    setExecutionDialogOpen(true);
                  }} data-testid="button-record-consumption">
                    <Package className="h-4 w-4 mr-2" /> Record Material Consumption
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => {
                    setExecutionType("yield-record");
                    setExecutionDialogOpen(true);
                  }} data-testid="button-record-yield">
                    <Target className="h-4 w-4 mr-2" /> Record Yield
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => {
                    setExecutionType("qc-trigger");
                    setExecutionDialogOpen(true);
                  }} data-testid="button-trigger-qc">
                    <Beaker className="h-4 w-4 mr-2" /> Trigger In-Process QC
                  </Button>
                  <Button className="w-full justify-start text-red-600 hover:text-red-700" variant="outline" onClick={() => {
                    setExecutionType("deviation");
                    setExecutionDialogOpen(true);
                  }} data-testid="button-log-deviation">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Log Deviation
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => {
                    setExecutionType("comment");
                    setExecutionDialogOpen(true);
                  }} data-testid="button-add-comment">
                    <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Dialog */}
      <Dialog open={executionDialogOpen} onOpenChange={setExecutionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{executionType.replace("-", " ")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createExecutionMutation.mutate({
              executionType,
              materialName: formData.get("materialName"),
              quantityUsed: formData.get("quantityUsed"),
              uom: formData.get("uom") || "units",
              yieldRecorded: formData.get("yieldRecorded"),
              deviationDescription: formData.get("deviationDescription"),
              deviationSeverity: formData.get("deviationSeverity"),
              comment: formData.get("comment"),
            });
          }} className="space-y-4">
            {executionType === "material-consumption" && (
              <>
                <Input name="materialName" placeholder="Material Name" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="quantityUsed" placeholder="Quantity" type="number" required />
                  <Input name="uom" placeholder="UOM" defaultValue="units" />
                </div>
              </>
            )}
            {executionType === "yield-record" && (
              <Input name="yieldRecorded" placeholder="Yield %" type="number" step="0.01" required />
            )}
            {executionType === "deviation" && (
              <>
                <Textarea name="deviationDescription" placeholder="Describe the deviation..." required />
                <Select name="deviationSeverity" defaultValue="minor">
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {(executionType === "comment" || executionType === "qc-trigger") && (
              <Textarea name="comment" placeholder="Enter details..." required />
            )}
            <Button type="submit" className="w-full" disabled={createExecutionMutation.isPending}>
              <Save className="h-4 w-4 mr-2" /> Save Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
