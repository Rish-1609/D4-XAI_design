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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sidebar } from "@/components/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Eye,
  CheckSquare,
  FileCheck,
  Shield,
  ClipboardList,
  Download,
  Award,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Package,
  Target,
  Zap,
  Settings,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Edit3,
  ChevronDown,
  ChevronRight,
  Upload,
  Save,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { ProductionOrder, BatchRelease, BatchWorkflowStep, InsertBatchWorkflowStep } from "@shared/schema";
import { insertBatchWorkflowStepSchema } from "@shared/schema";

// Form schemas
const stepEditSchema = insertBatchWorkflowStepSchema.extend({
  evidence: z.string().optional(),
  deviations: z.string().optional(),
  correctiveActions: z.string().optional(),
  requiredActions: z.string().optional(),
  completedActions: z.string().optional(),
});

type StepEditForm = z.infer<typeof stepEditSchema>;

const addStepSchema = z.object({
  stepName: z.string().min(1, "Step name is required"),
  stepCategory: z.string().min(1, "Category is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  assignedTeam: z.string().min(1, "Team is required"),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(1).default(1),
  approvalRequired: z.boolean().default(true),
  requiredActions: z.string().optional(),
});

type AddStepForm = z.infer<typeof addStepSchema>;

// Helper function to parse JSON strings safely
const parseJsonArray = (jsonString: string | null): string[] => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

// Helper function to stringify arrays for storage
const stringifyArray = (arr: string[]): string => {
  return JSON.stringify(arr);
};

// Helper functions
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'released':
    case 'approved':
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'under-testing':
    case 'in_progress':
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'on-hold':
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'released':
    case 'approved':
    case 'completed':
      return "default";
    case 'under-testing':
    case 'in_progress':
    case 'pending':
      return "secondary";
    case 'rejected':
      return "destructive";
    case 'on-hold':
      return "outline";
    default:
      return "outline";
  }
};

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function QABatchRelease() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedBatch, setExpandedBatch] = useState<string>("");
  const [editingStep, setEditingStep] = useState<BatchWorkflowStep | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: batchReleases = [] } = useQuery<BatchRelease[]>({
    queryKey: ["/api/batch-releases"],
  });

  // Fetch workflow steps for expanded batches
  const { data: batchWorkflowSteps = [] } = useQuery<BatchWorkflowStep[]>({
    queryKey: ["/api/batch-workflow-steps/batch", expandedBatch],
    enabled: expandedBatch !== "",
  });

  // Edit step form
  const editStepForm = useForm<StepEditForm>({
    resolver: zodResolver(stepEditSchema),
    defaultValues: {
      stepName: "",
      stepCategory: "",
      status: "pending",
      assignedTo: "",
      assignedTeam: "",
      findings: "",
      evidence: "",
      deviations: "",
      correctiveActions: "",
      requiredActions: "",
      completedActions: "",
      comments: "",
      estimatedHours: 0,
    },
  });

  // Add step form
  const addStepForm = useForm<AddStepForm>({
    resolver: zodResolver(addStepSchema),
    defaultValues: {
      stepName: "",
      stepCategory: "",
      assignedTo: "",
      assignedTeam: "",
      estimatedHours: 1,
      approvalRequired: true,
      requiredActions: "",
    },
  });

  // Filter batches based on search and status
  const filteredBatches = useMemo(() => {
    let filtered = batchReleases;

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(batch => batch.releaseStatus === selectedStatus);
    }

    return filtered;
  }, [searchTerm, selectedStatus, batchReleases]);

  // Statistics
  const stats = useMemo(() => {
    const total = batchReleases.length;
    const released = batchReleases.filter(batch => batch.releaseStatus === "released").length;
    const pending = batchReleases.filter(batch => batch.releaseStatus === "under-testing").length;
    const onHold = batchReleases.filter(batch => batch.releaseStatus === "on-hold").length;

    return { total, released, pending, onHold };
  }, [batchReleases]);

  // Mutations
  const updateStepMutation = useMutation({
    mutationFn: ({ stepId, data }: { stepId: string; data: Partial<StepEditForm> }) => {
      const processedData = {
        ...data,
        evidence: data.evidence ? stringifyArray([data.evidence]) : undefined,
        deviations: data.deviations ? stringifyArray([data.deviations]) : undefined,
        correctiveActions: data.correctiveActions ? stringifyArray([data.correctiveActions]) : undefined,
        requiredActions: data.requiredActions ? stringifyArray([data.requiredActions]) : undefined,
        completedActions: data.completedActions ? stringifyArray([data.completedActions]) : undefined,
      };
      return apiRequest(`/api/batch-workflow-steps/${stepId}`, "PATCH", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", expandedBatch] });
      toast({ title: "Step updated successfully" });
      setIsEditDialogOpen(false);
      setEditingStep(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update step", variant: "destructive" });
    },
  });

  const approveStepMutation = useMutation({
    mutationFn: ({ stepId }: { stepId: string }) =>
      apiRequest(`/api/batch-workflow-steps/${stepId}/approve`, "POST", { approvedBy: "Current User" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", expandedBatch] });
      toast({ title: "Step approved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve step", variant: "destructive" });
    },
  });

  const rejectStepMutation = useMutation({
    mutationFn: ({ stepId, reason }: { stepId: string; reason: string }) =>
      apiRequest(`/api/batch-workflow-steps/${stepId}/reject`, "POST", { rejectedBy: "Current User", rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", expandedBatch] });
      toast({ title: "Step rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject step", variant: "destructive" });
    },
  });

  const addStepMutation = useMutation({
    mutationFn: (data: AddStepForm & { batchReleaseId: string; stepNumber: number }) => {
      const processedData = {
        ...data,
        requiredActions: data.requiredActions ? stringifyArray([data.requiredActions]) : stringifyArray([]),
        completedActions: stringifyArray([]),
        evidence: stringifyArray([]),
        deviations: stringifyArray([]),
        correctiveActions: stringifyArray([]),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };
      return apiRequest("/api/batch-workflow-steps", "POST", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", selectedBatchId] });
      toast({ title: "New step added successfully" });
      setIsAddStepDialogOpen(false);
      addStepForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add step", variant: "destructive" });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => apiRequest(`/api/batch-workflow-steps/${stepId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps/batch", expandedBatch] });
      toast({ title: "Step deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete step", variant: "destructive" });
    },
  });

  // Helper functions
  const openEditDialog = (step: BatchWorkflowStep) => {
    setEditingStep(step);
    editStepForm.reset({
      stepName: step.stepName,
      stepCategory: step.stepCategory,
      status: step.status,
      assignedTo: step.assignedTo,
      assignedTeam: step.assignedTeam,
      findings: step.findings || "",
      evidence: parseJsonArray(step.evidence).join(", "),
      deviations: parseJsonArray(step.deviations).join(", "),
      correctiveActions: parseJsonArray(step.correctiveActions).join(", "),
      requiredActions: parseJsonArray(step.requiredActions).join(", "),
      completedActions: parseJsonArray(step.completedActions).join(", "),
      comments: step.comments || "",
      estimatedHours: step.estimatedHours || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: StepEditForm) => {
    if (editingStep) {
      updateStepMutation.mutate({ stepId: editingStep.id, data });
    }
  };

  const handleAddStep = (data: AddStepForm) => {
    const maxStepNumber = Math.max(...batchWorkflowSteps.map(s => s.stepNumber), 0);
    addStepMutation.mutate({
      ...data,
      batchReleaseId: selectedBatchId,
      stepNumber: maxStepNumber + 1,
    });
  };

  const calculateProgress = (batchId: string) => {
    if (batchId !== expandedBatch) return 0; // Only calculate for expanded batch
    if (batchWorkflowSteps.length === 0) return 0;
    const completedSteps = batchWorkflowSteps.filter(step => step.status === 'completed' || step.status === 'approved').length;
    return Math.round((completedSteps / batchWorkflowSteps.length) * 100);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">QA & Batch Release</h1>
                <p className="text-gray-600 mt-1">
                  Monitor and manage batch release workflows with detailed step tracking
                </p>
              </div>
            </div>

            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="total-batches">
                    {stats.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active batch releases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Released</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="released-batches">
                    {stats.released}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Approved for distribution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Under Testing</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600" data-testid="pending-batches">
                    {stats.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Under testing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600" data-testid="on-hold-batches">
                    {stats.onHold}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Search & Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search batches, products, or order numbers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                        data-testid="input-search-batches"
                      />
                    </div>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="under-testing">Under Testing</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Batch Release Management */}
            <div className="space-y-6">
              {filteredBatches.map((batch) => {
                const isExpanded = expandedBatch === batch.id;
                const progress = calculateProgress(batch.id);
                
                return (
                  <Card key={batch.id} className="border-l-4 border-l-blue-500">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setExpandedBatch(isExpanded ? "" : batch.id);
                            setSelectedBatchId(batch.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Package className="w-8 h-8 text-blue-600" />
                                <div>
                                  <CardTitle className="text-xl text-gray-900">
                                    {batch.batchNumber}
                                  </CardTitle>
                                  <CardDescription className="text-base mt-1">
                                    Product: {batch.productName} | Code: {batch.productCode}
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Overall Progress</div>
                                <div className="flex items-center space-x-2">
                                  <Progress value={progress} className="w-24" />
                                  <span className="text-sm font-medium">{progress}%</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(batch.releaseStatus)}
                                <Badge variant={getStatusVariant(batch.releaseStatus)} className="text-xs">
                                  {batch.releaseStatus.replace('-', ' ').toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Batch Summary Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs text-muted-foreground">Manufacturing Date</div>
                                <div className="text-sm font-medium">{formatDate(batch.manufacturedDate)}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs text-muted-foreground">Batch Size</div>
                                <div className="text-sm font-medium">{batch.batchSize?.toLocaleString() || 'N/A'} units</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs text-muted-foreground">QA Manager</div>
                                <div className="text-sm font-medium">{batch.qaApprovedBy || 'Dr. Priya Sharma'}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-xs text-muted-foreground">Certificate</div>
                                <div className="text-sm font-medium">
                                  {batch.releaseStatus === 'released' ? (
                                    <Badge variant="outline">Generated</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">Pending</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      {isExpanded && (
                        <CollapsibleContent>
                          <CardContent className="pt-0 bg-gray-50">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-2">
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-800">
                                  Audit Steps & Workflow ({batchWorkflowSteps.filter(step => step.status === 'completed' || step.status === 'approved').length}/{batchWorkflowSteps.length} Complete)
                                </h3>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAddStepDialogOpen(true);
                                }}
                                size="sm"
                                data-testid="button-add-step"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Step
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              {batchWorkflowSteps
                                .sort((a, b) => a.stepNumber - b.stepNumber)
                                .map((step) => (
                                <div key={step.id} className="bg-white border rounded-lg p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      {getStatusIcon(step.status)}
                                      <div>
                                        <h4 className="font-semibold text-lg">{step.stepName}</h4>
                                        <p className="text-sm text-muted-foreground">{step.stepCategory}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant={getStatusVariant(step.status)} className="text-sm px-3 py-1">
                                        {step.status.toUpperCase()}
                                      </Badge>
                                      {step.approvalRequired && (
                                        <Badge variant="outline" className="text-xs">
                                          <Shield className="h-3 w-3 mr-1" />
                                          Approval Required
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                      <div className="text-xs text-muted-foreground font-medium">Assigned To</div>
                                      <div className="text-sm font-medium">{step.assignedTo}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground font-medium">Reviewed By</div>
                                      <div className="text-sm font-medium">{step.approvedBy || 'QA Manager'}</div>
                                    </div>
                                    {step.completedAt && (
                                      <div>
                                        <div className="text-xs text-muted-foreground font-medium">Completed Date</div>
                                        <div className="text-sm">{formatDate(step.completedAt)}</div>
                                      </div>
                                    )}
                                    {step.approvedAt && (
                                      <div>
                                        <div className="text-xs text-muted-foreground font-medium">Reviewed Date</div>
                                        <div className="text-sm">{formatDate(step.approvedAt)}</div>
                                      </div>
                                    )}
                                  </div>

                                  {step.findings && (
                                    <div className="mb-4">
                                      <div className="text-xs text-muted-foreground font-medium mb-2">Findings</div>
                                      <div className="text-sm bg-blue-50 p-3 rounded border">{step.findings}</div>
                                    </div>
                                  )}

                                  {step.evidence && parseJsonArray(step.evidence).length > 0 && (
                                    <div className="mb-4">
                                      <div className="text-xs text-muted-foreground font-medium mb-2">Evidence</div>
                                      <div className="flex flex-wrap gap-2">
                                        {parseJsonArray(step.evidence).map((evidence, index) => (
                                        <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                          <FileText className="h-3 w-3 mr-1" />
                                          {evidence}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                  <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditDialog(step);
                                        }}
                                        data-testid={`button-edit-step-${step.id}`}
                                      >
                                        <Edit3 className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      
                                      {step.approvalRequired && step.status === 'completed' && (
                                        <Button 
                                          size="sm" 
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            approveStepMutation.mutate({ stepId: step.id });
                                          }}
                                          data-testid={`button-approve-step-${step.id}`}
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          Approve Step
                                        </Button>
                                      )}
                                      
                                      {step.status !== 'approved' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const reason = prompt("Rejection reason:");
                                            if (reason) {
                                              rejectStepMutation.mutate({ stepId: step.id, reason });
                                            }
                                          }}
                                          data-testid={`button-reject-step-${step.id}`}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      )}
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm("Are you sure you want to delete this step?")) {
                                            deleteStepMutation.mutate(step.id);
                                          }
                                        }}
                                        data-testid={`button-delete-step-${step.id}`}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  </Card>
                );
              })}
            </div>

            {/* Edit Step Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Workflow Step</DialogTitle>
                </DialogHeader>
                <Form {...editStepForm}>
                  <form onSubmit={editStepForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editStepForm.control}
                        name="stepName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Step Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editStepForm.control}
                        name="stepCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editStepForm.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editStepForm.control}
                        name="assignedTeam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Team</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={editStepForm.control}
                      name="findings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Findings</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editStepForm.control}
                      name="evidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidence (comma-separated)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="File1.pdf, Report2.xlsx" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateStepMutation.isPending}>
                        {updateStepMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Add Step Dialog */}
            <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Workflow Step</DialogTitle>
                </DialogHeader>
                <Form {...addStepForm}>
                  <form onSubmit={addStepForm.handleSubmit(handleAddStep)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addStepForm.control}
                        name="stepName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Step Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter step name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addStepForm.control}
                        name="stepCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Documentation">Documentation</SelectItem>
                                  <SelectItem value="Testing">Testing</SelectItem>
                                  <SelectItem value="Materials Verification">Materials Verification</SelectItem>
                                  <SelectItem value="Process Controls">Process Controls</SelectItem>
                                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                                  <SelectItem value="Environmental">Environmental</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addStepForm.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Person responsible" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addStepForm.control}
                        name="assignedTeam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Team</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Team responsible" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addStepForm.control}
                        name="estimatedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Hours</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addStepForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={addStepForm.control}
                      name="requiredActions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Actions</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Describe required actions..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddStepDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addStepMutation.isPending}>
                        {addStepMutation.isPending ? "Adding..." : "Add Step"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </div>
  );
}