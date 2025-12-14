import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Truck,
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Search,
  FileText,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Factory,
} from "lucide-react";
import type { JobWork, ProductionBatch, BatchReview } from "@shared/schema";

const jobWorkFormSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  vendorCode: z.string().optional(),
  vendorContact: z.string().optional(),
  processDescription: z.string().min(1, "Process description is required"),
  batchId: z.string().optional(),
  materialIssuedQty: z.coerce.number().min(1, "Quantity required"),
  expectedReceiptQty: z.coerce.number().min(1, "Expected receipt required"),
  expectedReceiptDate: z.string().min(1, "Expected date required"),
  notes: z.string().optional(),
});

type JobWorkFormValues = z.infer<typeof jobWorkFormSchema>;

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getJobWorkStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-gray-100 text-gray-800";
    case "issued": return "bg-blue-100 text-blue-800";
    case "in-progress": return "bg-yellow-100 text-yellow-800";
    case "received": return "bg-purple-100 text-purple-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

function JobWorksTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: jobWorks = [], isLoading } = useQuery<JobWork[]>({
    queryKey: ["/api/job-works"],
  });

  const { data: batches = [] } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const form = useForm<JobWorkFormValues>({
    resolver: zodResolver(jobWorkFormSchema),
    defaultValues: {
      vendorName: "",
      vendorCode: "",
      vendorContact: "",
      processDescription: "",
      materialIssuedQty: 0,
      expectedReceiptQty: 0,
      expectedReceiptDate: "",
      notes: "",
    },
  });

  const createJobWorkMutation = useMutation({
    mutationFn: async (data: JobWorkFormValues) => {
      const jobWorkNumber = `JW-${Date.now().toString().slice(-8)}`;
      return apiRequest("POST", "/api/job-works", {
        ...data,
        jobWorkNumber,
        expectedReceiptDate: new Date(data.expectedReceiptDate),
        materialIssuedDate: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-works"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Job work created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create job work", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/job-works/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-works"] });
      toast({ title: "Status Updated", description: "Job work status has been updated" });
    },
  });

  const filteredJobWorks = jobWorks.filter(jw => {
    const matchesSearch = jw.jobWorkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jw.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || jw.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    pending: jobWorks.filter(jw => jw.status === "pending").length,
    issued: jobWorks.filter(jw => jw.status === "issued").length,
    inProgress: jobWorks.filter(jw => jw.status === "in-progress").length,
    received: jobWorks.filter(jw => jw.status === "received").length,
    completed: jobWorks.filter(jw => jw.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search job works..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search-job-works"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-jw-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-job-work">
              <Plus className="h-4 w-4 mr-2" />
              New Job Work
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Work Order</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createJobWorkMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ABC Processing Ltd" {...field} data-testid="input-vendor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vendorCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., VND-001" {...field} data-testid="input-vendor-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="processDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Process Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the job work process..." {...field} data-testid="input-process" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Batch (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-batch">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map(batch => (
                            <SelectItem key={batch.id} value={batch.id}>{batch.batchNumber} - {batch.productName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="materialIssuedQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material Issued Qty</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-issued-qty" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedReceiptQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Receipt Qty</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-expected-qty" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedReceiptDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Receipt Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-expected-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createJobWorkMutation.isPending} data-testid="button-submit-job-work">
                  {createJobWorkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                  Create Job Work
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter(status === "inProgress" ? "in-progress" : status)}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 capitalize">{status === "inProgress" ? "In Progress" : status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredJobWorks.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No job work orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">JW #</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Process</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Issued Qty</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Expected</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobWorks.map((jw, index) => (
                    <tr key={jw.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`} data-testid={`job-work-row-${jw.id}`}>
                      <td className="px-4 py-3 font-mono font-semibold text-sm">{jw.jobWorkNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{jw.vendorName}</p>
                        <p className="text-xs text-gray-500">{jw.vendorCode}</p>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{jw.processDescription}</td>
                      <td className="px-4 py-3 text-sm">{jw.materialIssuedQty?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{jw.expectedReceiptQty?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge className={getJobWorkStatusColor(jw.status)}>{jw.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {jw.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "issued" })}>Issue</Button>
                          )}
                          {jw.status === "issued" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "in-progress" })}>Start</Button>
                          )}
                          {jw.status === "in-progress" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "received" })}>Receive</Button>
                          )}
                          {jw.status === "received" && (
                            <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "completed" })}>Complete</Button>
                          )}
                        </div>
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
  );
}

function BatchReviewsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const { toast } = useToast();

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: reviews = [] } = useQuery<BatchReview[]>({
    queryKey: ["/api/batch-reviews"],
  });

  const reviewableBatches = batches.filter(b => 
    b.status === "completed" || b.status === "qc-hold"
  );

  const filteredBatches = reviewableBatches.filter(batch =>
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const selectedReview = reviews.find(r => r.batchId === selectedBatchId);

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/batch-reviews", {
        batchId: selectedBatchId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      toast({ title: "Success", description: "Batch review submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("PATCH", `/api/batch-reviews/${reviewId}`, {
        reviewStatus: "approved",
        approvedBy: "Current User",
        approvedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-reviews"] });
      toast({ title: "Approved", description: "Batch has been approved for QA handoff" });
    },
  });

  const ReviewChecklist = ({ batch }: { batch: ProductionBatch }) => {
    const [checks, setChecks] = useState({
      allStagesCompleted: false,
      yieldRecorded: !!batch.yieldPercentage,
      deviationsLogged: true,
      materialBalanceOk: true,
    });
    const [closureNotes, setClosureNotes] = useState("");
    const allChecked = Object.values(checks).every(Boolean);

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Batch Number</p>
              <p className="font-medium">{batch.batchNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Product</p>
              <p className="font-medium">{batch.productName}</p>
            </div>
            <div>
              <p className="text-gray-500">Target Qty</p>
              <p className="font-medium">{batch.targetQuantity?.toLocaleString()} {batch.uom}</p>
            </div>
            <div>
              <p className="text-gray-500">Yield</p>
              <p className="font-medium">{batch.yieldPercentage ? `${batch.yieldPercentage}%` : "Not recorded"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(checks).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => setChecks(prev => ({ ...prev, [key]: !!checked }))}
              />
              <span className="flex-1 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              {value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <Textarea
          placeholder="Add closure notes..."
          value={closureNotes}
          onChange={(e) => setClosureNotes(e.target.value)}
          rows={2}
        />

        <Button
          className="w-full"
          disabled={!allChecked || createReviewMutation.isPending}
          onClick={() => createReviewMutation.mutate({
            ...checks,
            reviewStatus: "in-review",
            closureNotes,
            reviewedBy: "Current User",
            reviewedAt: new Date(),
          })}
        >
          {createReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
          Submit for QA Review
        </Button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Batches Ready for Review</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-reviews"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No batches ready for review</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredBatches.map(batch => {
                const review = reviews.find(r => r.batchId === batch.id);
                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition ${
                      selectedBatchId === batch.id ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{batch.batchNumber}</p>
                        <p className="text-xs text-gray-600">{batch.productName}</p>
                      </div>
                      <Badge className={
                        review?.reviewStatus === "approved" ? "bg-green-100 text-green-800" :
                        review?.reviewStatus === "in-review" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {review?.reviewStatus || "Needs Review"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Batch Review</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedBatch ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a batch to review</p>
            </div>
          ) : selectedReview && selectedReview.reviewStatus === "approved" ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-700 font-semibold">Batch Approved</p>
              <p className="text-sm text-gray-600 mt-2">Approved by {selectedReview.approvedBy}</p>
            </div>
          ) : selectedReview && selectedReview.reviewStatus === "in-review" ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800">Review Submitted</p>
                <p className="text-sm text-blue-700">Submitted by {selectedReview.reviewedBy}</p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => approveReviewMutation.mutate(selectedReview.id)}
                disabled={approveReviewMutation.isPending}
              >
                {approveReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve for QA Handoff
              </Button>
            </div>
          ) : (
            <ReviewChecklist batch={selectedBatch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const completedBatches = batches.filter(b => b.status === "completed");
  const inProgressBatches = batches.filter(b => b.status === "in-progress");
  const plannedBatches = batches.filter(b => b.status === "planned");
  const delayedBatches = batches.filter(b => b.isDelayed);

  const avgYield = completedBatches.length > 0
    ? completedBatches.reduce((sum, b) => sum + (parseFloat(b.yieldPercentage?.toString() || "0")), 0) / completedBatches.length
    : 0;

  const totalScrap = batches.reduce((sum, b) => sum + (b.scrapQuantity || 0), 0);
  const totalRework = batches.reduce((sum, b) => sum + (b.reworkQuantity || 0), 0);

  const sites = Array.from(new Set(batches.map(b => b.site)));

  const onTimeCompletion = completedBatches.filter(b => {
    if (!b.plannedEndDate || !b.actualEndDate) return false;
    return new Date(b.actualEndDate) <= new Date(b.plannedEndDate);
  }).length;

  const onTimeRate = completedBatches.length > 0 
    ? (onTimeCompletion / completedBatches.length * 100).toFixed(1)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{batches.length}</div>
            <p className="text-xs text-gray-500">{completedBatches.length} completed</p>
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
              {avgYield >= 95 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
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
            <p className="text-xs text-gray-500">{onTimeCompletion} of {completedBatches.length} on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delayed Batches</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{delayedBatches.length}</div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Plan vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${completedBatches.length > 0 ? (completedBatches.length / batches.length * 100) : 0}%` }} />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Site Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sites.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 col-span-3">No site data available</p>
            ) : (
              sites.map(site => {
                const siteBatches = batches.filter(b => b.site === site);
                const siteCompleted = siteBatches.filter(b => b.status === "completed").length;
                return (
                  <div key={site} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{site}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{siteBatches.length} batches</span>
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
  );
}

export default function ReleaseAnalytics() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Release & Analytics</h1>
            <p className="text-gray-600 mt-1">Manage job works, batch reviews, and production analytics</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <Tabs defaultValue="job-works" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="job-works" data-testid="tab-job-works">
                <Truck className="h-4 w-4 mr-2" />
                Job Works
              </TabsTrigger>
              <TabsTrigger value="batch-reviews" data-testid="tab-batch-reviews">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Batch Reviews
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="job-works">
              <JobWorksTab />
            </TabsContent>

            <TabsContent value="batch-reviews">
              <BatchReviewsTab />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
