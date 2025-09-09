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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

// Helper functions
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short", 
    day: "numeric",
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed': case 'Released': case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'In Progress': case 'Pending Release': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'Pending': case 'Not Started': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'Rejected': case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Completed': case 'Released': case 'Approved': return "default";
    case 'In Progress': case 'Pending Release': return "secondary";
    case 'Rejected': case 'Failed': return "destructive";
    default: return "outline";
  }
};

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
  const { data: workflowSteps = [] } = useQuery<BatchWorkflowStep[]>({
    queryKey: ["/api/batch-workflow-steps"],
    enabled: expandedBatch !== "",
  });

  // Filter workflow steps by batch
  const batchWorkflowSteps = workflowSteps.filter(step => step.batchReleaseId === expandedBatch);

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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-workflow-steps"] });
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
    const steps = workflowSteps.filter(step => step.batchReleaseId === batchId);
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.status === 'completed' || step.status === 'approved').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">QC & Batch Release</h2>
              <p className="text-gray-600 text-sm mt-1">
                Pharmaceutical batch release workflow with QA approval and certificate generation
              </p>
            </div>
            <Button onClick={() => {/* Add batch creation logic */}} data-testid="button-create-batch">
              <Plus className="h-4 w-4 mr-2" />
              New Batch Release
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-batches">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for release
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Released Batches</CardTitle>
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
                <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
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

                <CardContent>
                  {/* Audit Steps Workflow */}
                  <Accordion 
                    type="single" 
                    collapsible 
                    value={expandedBatch === batch.id ? "item-1" : ""} 
                    onValueChange={(value) => setExpandedBatch(value ? batch.id : "")}
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4" />
                          <span>Audit Steps & Workflow ({batch.auditSteps.filter(step => step.status === 'Completed' || step.status === 'Approved').length}/{batch.auditSteps.length} Complete)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {batch.auditSteps.map((step) => (
                            <div key={step.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(step.status)}
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-muted-foreground">{step.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getStatusVariant(step.status)}>
                                    {step.status}
                                  </Badge>
                                  {step.approval_required && (
                                    <Badge variant="outline" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Approval Required
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <div className="text-xs text-muted-foreground">Assigned To</div>
                                  <div className="text-sm font-medium">{step.assignedTo}</div>
                                </div>
                                {step.reviewedBy && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Reviewed By</div>
                                    <div className="text-sm font-medium">{step.reviewedBy}</div>
                                  </div>
                                )}
                                {step.completedAt && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Completed Date</div>
                                    <div className="text-sm">{formatDate(step.completedAt)}</div>
                                  </div>
                                )}
                                {step.reviewedAt && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Reviewed Date</div>
                                    <div className="text-sm">{formatDate(step.reviewedAt)}</div>
                                  </div>
                                )}
                              </div>

                              {step.findings && (
                                <div className="mb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Findings</div>
                                  <div className="text-sm bg-gray-50 rounded p-2">{step.findings}</div>
                                </div>
                              )}

                              {step.evidence.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Evidence</div>
                                  <div className="flex flex-wrap gap-1">
                                    {step.evidence.map((evidence, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {evidence}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.status === 'Completed' && step.approval_required && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => approveStepMutation.mutate({ 
                                      stepId: step.id, 
                                      approvedBy: 'Current User' 
                                    })}
                                    disabled={approveStepMutation.isPending}
                                  >
                                    <CheckSquare className="mr-1 h-3 w-3" />
                                    Approve Step
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Eye className="mr-1 h-3 w-3" />
                                    Review Details
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </div>
                    
                    {batch.status === 'Pending Release' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleBatchApproval(batch.id)}
                        disabled={approveBatchMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve & Release Batch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}