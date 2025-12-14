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
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Package,
  Factory,
  Layers,
  Search,
  ChevronRight,
  Loader2,
  PlayCircle,
} from "lucide-react";
import type { ProductionBatch, Bom, ProductionOrder } from "@shared/schema";

const batchFormSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().min(1, "Product code is required"),
  bomId: z.string().optional(),
  site: z.string().min(1, "Site is required"),
  targetQuantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  uom: z.string().default("units"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  plannedStartDate: z.string().min(1, "Start date is required"),
  plannedEndDate: z.string().min(1, "End date is required"),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function JobScheduling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: boms = [] } = useQuery<Bom[]>({
    queryKey: ["/api/boms"],
  });

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      productName: "",
      productCode: "",
      site: "Main Plant",
      targetQuantity: 1000,
      uom: "units",
      priority: "medium",
      plannedStartDate: "",
      plannedEndDate: "",
      assignedTo: "",
      notes: "",
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: BatchFormValues) => {
      const batchNumber = `BATCH-${Date.now().toString().slice(-8)}`;
      return apiRequest("POST", "/api/production-batches", {
        ...data,
        batchNumber,
        plannedStartDate: new Date(data.plannedStartDate),
        plannedEndDate: new Date(data.plannedEndDate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Production batch scheduled successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to schedule batch", variant: "destructive" });
    },
  });

  const plannedBatches = batches.filter(b => b.status === "planned");
  const scheduledBatches = batches.filter(b => searchTerm ? 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productName.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  // Production Readiness Check (simplified simulation)
  const checkReadiness = (batch: ProductionBatch) => {
    const checks = {
      materialAvailable: Math.random() > 0.2,
      bomApproved: !!batch.bomId,
      qcMethodReady: Math.random() > 0.3,
      noCapacityConflict: Math.random() > 0.1,
    };
    const allReady = Object.values(checks).every(Boolean);
    return { checks, allReady };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Scheduling</h1>
                <p className="text-gray-600 mt-1">Plan and schedule production batches</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-schedule-batch">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Production Batch</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createBatchMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Paracetamol 500mg" {...field} data-testid="input-product-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="productCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., PARA-500" {...field} data-testid="input-product-code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bomId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BOM / Recipe</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-bom">
                                    <SelectValue placeholder="Select BOM" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {boms.map(bom => (
                                    <SelectItem key={bom.id} value={bom.id}>{bom.productName} (v{bom.version})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="site"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-site">
                                    <SelectValue placeholder="Select site" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Main Plant">Main Plant</SelectItem>
                                  <SelectItem value="Plant B">Plant B</SelectItem>
                                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="targetQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} data-testid="input-quantity" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="uom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UOM</FormLabel>
                              <FormControl>
                                <Input placeholder="units" {...field} data-testid="input-uom" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="plannedStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned Start</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} data-testid="input-start-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plannedEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned End</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} data-testid="input-end-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <FormControl>
                              <Input placeholder="Operator name" {...field} data-testid="input-assigned" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any special instructions..." {...field} data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createBatchMutation.isPending} data-testid="button-submit-batch">
                        {createBatchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                        Schedule Batch
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Planned Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{plannedBatches.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{batches.filter(b => b.status === "in-progress").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{batches.filter(b => b.priority === "high" || b.priority === "critical").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed (MTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{batches.filter(b => b.status === "completed").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Batches */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Batches
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                    data-testid="input-search"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : scheduledBatches.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No batches scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledBatches.map(batch => {
                    const { checks, allReady } = checkReadiness(batch);
                    return (
                      <div key={batch.id} className="border rounded-lg p-4 hover:bg-gray-50 transition" data-testid={`scheduled-batch-${batch.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono font-semibold">{batch.batchNumber}</span>
                              <Badge className={batch.priority === "critical" ? "bg-red-500" : batch.priority === "high" ? "bg-orange-500" : "bg-blue-500"} variant="secondary">
                                {batch.priority}
                              </Badge>
                              <Badge className={batch.status === "planned" ? "bg-gray-100 text-gray-800" : batch.status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                                {batch.status}
                              </Badge>
                            </div>
                            <p className="text-gray-900 font-medium">{batch.productName}</p>
                            <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {batch.targetQuantity?.toLocaleString()} {batch.uom}</span>
                              <span className="flex items-center gap-1"><Factory className="h-4 w-4" /> {batch.site}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDate(batch.plannedStartDate)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              allReady ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {allReady ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              {allReady ? "Ready" : "Not Ready"}
                            </div>
                            <div className="mt-2 space-x-1">
                              {Object.entries(checks).map(([key, value]) => (
                                <span key={key} title={key} className={`inline-block h-2 w-2 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`} />
                              ))}
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
        </div>
      </div>
    </div>
  );
}
