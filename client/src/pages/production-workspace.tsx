import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  Filter,
  Search,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import type { ProductionBatch, BatchStage, BatchExecution, JobCard } from "@shared/schema";

const batchFormSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().min(1, "Product code is required"),
  site: z.string().min(1, "Site is required"),
  targetQuantity: z.coerce.number().min(1, "Target quantity must be at least 1"),
  uom: z.string().default("kg"),
  priority: z.string().default("normal"),
  status: z.string().default("not-started"),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchFormSchema>;

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
  
  // Batch management state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  
  const createForm = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      batchNumber: "",
      productName: "",
      productCode: "",
      site: "",
      targetQuantity: 0,
      uom: "kg",
      priority: "normal",
      status: "not-started",
      notes: "",
    },
  });
  
  const editForm = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      batchNumber: "",
      productName: "",
      productCode: "",
      site: "",
      targetQuantity: 0,
      uom: "kg",
      priority: "normal",
      status: "not-started",
      notes: "",
    },
  });

  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
    enabled: !batchId,
  });

  const { data: batch, isLoading: batchLoading } = useQuery<ProductionBatch>({
    queryKey: ["/api/production-batches", batchId],
    enabled: !!batchId,
  });

  const { data: stages = [] } = useQuery<BatchStage[]>({
    queryKey: ["/api/batch-stages/batch", batchId],
    enabled: !!batchId,
  });

  const { data: executions = [] } = useQuery<BatchExecution[]>({
    queryKey: ["/api/batch-executions/batch", batchId],
    enabled: !!batchId,
  });

  const { data: jobCards = [] } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards/batch", batchId],
    enabled: !!batchId,
  });

  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
  }, [stages]);

  // Filter batches based on search and status
  const filteredBatches = useMemo(() => {
    return allBatches.filter(b => {
      const matchesSearch = searchTerm === "" || 
        b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allBatches, searchTerm, statusFilter]);

  // Calculate batch progress
  const getBatchProgress = (b: ProductionBatch) => {
    const completedStages = b.completedStagesCount || 0;
    const totalStages = b.totalStagesCount || 0;
    if (totalStages === 0) return 0;
    return Math.round((completedStages / totalStages) * 100);
  };

  // CRUD Mutations
  const createBatchMutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      return apiRequest("POST", "/api/production-batches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Batch created", description: "New batch has been created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create batch", variant: "destructive" });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BatchFormData }) => {
      return apiRequest("PATCH", `/api/production-batches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      setEditDialogOpen(false);
      setSelectedBatch(null);
      editForm.reset();
      toast({ title: "Batch updated", description: "Batch has been updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update batch", variant: "destructive" });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/production-batches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      setDeleteDialogOpen(false);
      setSelectedBatch(null);
      toast({ title: "Batch deleted", description: "Batch has been deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete batch", variant: "destructive" });
    },
  });

  const openEditDialog = (b: ProductionBatch) => {
    setSelectedBatch(b);
    editForm.reset({
      batchNumber: b.batchNumber,
      productName: b.productName,
      productCode: b.productCode,
      site: b.site,
      targetQuantity: b.targetQuantity || 0,
      uom: b.uom || "kg",
      priority: b.priority,
      status: b.status,
      notes: b.notes || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (b: ProductionBatch) => {
    setSelectedBatch(b);
    setDeleteDialogOpen(true);
  };
  
  const onCreateSubmit = (data: BatchFormData) => {
    createBatchMutation.mutate(data);
  };
  
  const onEditSubmit = (data: BatchFormData) => {
    if (selectedBatch) {
      updateBatchMutation.mutate({ id: selectedBatch.id, data });
    }
  };

  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status }: { stageId: string; status: string }) => {
      return apiRequest("PATCH", `/api/batch-stages/${stageId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-stages/batch", batchId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/batch-executions/batch", batchId] });
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

  // Batch Form Component with react-hook-form
  const BatchFormFields = ({ form }: { form: ReturnType<typeof useForm<BatchFormData>> }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="batchNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Batch Number *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="BATCH-001" data-testid="input-batch-number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="productCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Product Code *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="PROD-001" data-testid="input-product-code" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="productName" render={({ field }) => (
        <FormItem>
          <FormLabel>Product Name *</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Product Name" data-testid="input-product-name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid grid-cols-3 gap-4">
        <FormField control={form.control} name="site" render={({ field }) => (
          <FormItem>
            <FormLabel>Site *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Site A" data-testid="input-site" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="targetQuantity" render={({ field }) => (
          <FormItem>
            <FormLabel>Target Quantity *</FormLabel>
            <FormControl>
              <Input {...field} type="number" placeholder="1000" data-testid="input-target-quantity" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="uom" render={({ field }) => (
          <FormItem>
            <FormLabel>UOM</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-uom"><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="units">units</SelectItem>
                <SelectItem value="liters">liters</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="priority" render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="notes" render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Additional notes..." data-testid="input-notes" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );

  if (!batchId) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Workspace</h1>
              <p className="text-gray-600">Manage and track production batches</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) createForm.reset(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { createForm.reset(); setCreateDialogOpen(true); }} data-testid="button-create-batch">
                  <Plus className="h-4 w-4 mr-2" /> New Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                  <DialogDescription>Fill in the batch details to create a new production batch.</DialogDescription>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
                    <BatchFormFields form={createForm} />
                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createBatchMutation.isPending} data-testid="button-submit-create">
                        {createBatchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Create Batch
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search batches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" data-testid="input-search-batches" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {batchesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Factory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{allBatches.length === 0 ? "No batches available" : "No batches match your filters"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map(b => (
                <Card key={b.id} className="hover:shadow-md transition-shadow group" data-testid={`batch-card-${b.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg cursor-pointer" onClick={() => window.location.href = `/production-workspace/${b.id}`}>{b.batchNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          b.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                          b.status === "completed" ? "bg-green-100 text-green-800" :
                          b.status === "on-hold" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {b.status}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDialog(b); }} data-testid={`button-edit-batch-${b.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); openDeleteDialog(b); }} data-testid={`button-delete-batch-${b.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => window.location.href = `/production-workspace/${b.id}`} className="cursor-pointer">
                    <p className="font-medium text-gray-900">{b.productName}</p>
                    <p className="text-sm text-gray-600">{b.productCode}</p>
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>{b.site}</span>
                      <span>{b.targetQuantity?.toLocaleString()} {b.uom}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{getBatchProgress(b)}%</span>
                      </div>
                      <Progress value={getBatchProgress(b)} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className={
                        b.priority === "critical" ? "border-red-500 text-red-600" :
                        b.priority === "high" ? "border-orange-500 text-orange-600" :
                        "border-blue-500 text-blue-600"
                      }>
                        {b.priority}
                      </Badge>
                      {b.currentStage && <span className="text-xs text-gray-500">Stage: {b.currentStage}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) { setSelectedBatch(null); editForm.reset(); } }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Batch</DialogTitle>
                <DialogDescription>Update the batch details.</DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                  <BatchFormFields form={editForm} />
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={updateBatchMutation.isPending} data-testid="button-submit-edit">
                      {updateBatchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete batch "{selectedBatch?.batchNumber}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => selectedBatch && deleteBatchMutation.mutate(selectedBatch.id)} className="bg-red-600 hover:bg-red-700" data-testid="button-confirm-delete">
                  {deleteBatchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="stages" data-testid="tab-stages">Stage Progress</TabsTrigger>
              <TabsTrigger value="job-cards" data-testid="tab-job-cards">Job Cards</TabsTrigger>
              <TabsTrigger value="execution" data-testid="tab-execution">Execution Log</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="stages">
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
            </TabsContent>

            <TabsContent value="job-cards">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {jobCards.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No job cards for this batch</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobCards.map(card => (
                        <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`job-card-${card.id}`}>
                          <div>
                            <p className="font-medium">{card.title}</p>
                            <p className="text-sm text-gray-600">{card.cardType} - {card.assignedTo || "Unassigned"}</p>
                          </div>
                          <Badge className={
                            card.status === "completed" ? "bg-green-100 text-green-800" :
                            card.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {card.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="execution">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Full Execution Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {executions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No execution records yet</p>
                  ) : (
                    <div className="space-y-3">
                      {executions.map(exec => (
                        <div key={exec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-testid={`execution-log-${exec.id}`}>
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
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents attached to this batch</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                <Input name="materialName" placeholder="Material Name" required data-testid="input-material-name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="quantityUsed" placeholder="Quantity" type="number" required data-testid="input-quantity-used" />
                  <Input name="uom" placeholder="UOM" defaultValue="units" data-testid="input-uom" />
                </div>
              </>
            )}
            {executionType === "yield-record" && (
              <Input name="yieldRecorded" placeholder="Yield %" type="number" step="0.01" required data-testid="input-yield" />
            )}
            {executionType === "deviation" && (
              <>
                <Textarea name="deviationDescription" placeholder="Describe the deviation..." required data-testid="input-deviation-description" />
                <Select name="deviationSeverity" defaultValue="minor">
                  <SelectTrigger data-testid="select-deviation-severity">
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
              <Textarea name="comment" placeholder="Enter details..." required data-testid="input-comment" />
            )}
            <Button type="submit" className="w-full" disabled={createExecutionMutation.isPending} data-testid="button-save-execution">
              <Save className="h-4 w-4 mr-2" /> Save Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
