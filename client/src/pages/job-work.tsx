import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  AlertCircle,
  Building,
  ArrowRight,
  Calendar,
  Loader2,
  Search,
  FileText,
  DollarSign,
} from "lucide-react";
import type { JobWork, ProductionBatch } from "@shared/schema";

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

const getStatusColor = (status: string) => {
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

export default function JobWork() {
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Work</h1>
                <p className="text-gray-600 mt-1">Manage external vendor job work and WIP</p>
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
                        name="vendorContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact person / phone" {...field} data-testid="input-vendor-contact" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional notes..." {...field} data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createJobWorkMutation.isPending} data-testid="button-submit-job-work">
                        {createJobWorkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
                        Create Job Work
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("pending")}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{statusCounts.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("issued")}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Issued</p>
                    <p className="text-2xl font-bold text-blue-600">{statusCounts.issued}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("in-progress")}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{statusCounts.inProgress}</p>
                  </div>
                  <Truck className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("received")}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Received</p>
                    <p className="text-2xl font-bold text-purple-600">{statusCounts.received}</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition" onClick={() => setStatusFilter("completed")}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Work List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Job Work Orders
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status">
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
              </div>
            </CardHeader>
            <CardContent>
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
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actual</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobWorks.map((jw, index) => (
                        <tr key={jw.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`} data-testid={`job-work-row-${jw.id}`}>
                          <td className="px-4 py-3 font-mono font-semibold text-sm">{jw.jobWorkNumber}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{jw.vendorName}</p>
                              <p className="text-xs text-gray-500">{jw.vendorCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm max-w-xs truncate">{jw.processDescription}</td>
                          <td className="px-4 py-3 text-sm">{jw.materialIssuedQty?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{jw.expectedReceiptQty?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{jw.actualReceiptQty?.toLocaleString() || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(jw.status)}>{jw.status}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {jw.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "issued" })} data-testid={`button-issue-${jw.id}`}>
                                  Issue
                                </Button>
                              )}
                              {jw.status === "issued" && (
                                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "in-progress" })} data-testid={`button-start-${jw.id}`}>
                                  Start
                                </Button>
                              )}
                              {jw.status === "in-progress" && (
                                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "received" })} data-testid={`button-receive-${jw.id}`}>
                                  Receive
                                </Button>
                              )}
                              {jw.status === "received" && (
                                <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: jw.id, status: "completed" })} data-testid={`button-complete-${jw.id}`}>
                                  Complete
                                </Button>
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
      </div>
    </div>
  );
}
