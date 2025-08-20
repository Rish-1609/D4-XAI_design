import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertProductionOrderSchema, type ProductionOrder, type InsertProductionOrder } from "@shared/schema";
import { Package, Plus, Search, Filter, Calendar, ChevronDown } from "lucide-react";

const priorities = [
  { value: "Low", label: "Low", color: "bg-gray-500" },
  { value: "Medium", label: "Medium", color: "bg-yellow-500" },
  { value: "High", label: "High", color: "bg-orange-500" },
  { value: "Critical", label: "Critical", color: "bg-red-500" },
];

const statuses = [
  { value: "Pending", label: "Pending", color: "bg-gray-500" },
  { value: "In Progress", label: "In Progress", color: "bg-blue-500" },
  { value: "Completed", label: "Completed", color: "bg-green-500" },
  { value: "On Hold", label: "On Hold", color: "bg-yellow-500" },
  { value: "Cancelled", label: "Cancelled", color: "bg-red-500" },
];

const getPriorityColor = (priority: string) => {
  return priorities.find(p => p.value === priority)?.color || "bg-gray-500";
};

const getStatusColor = (status: string) => {
  return statuses.find(s => s.value === status)?.color || "bg-gray-500";
};

export default function ProductionOrders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<ProductionOrder[]>({
    queryKey: ["/api/production-orders"],
    queryFn: () => fetch("/api/production-orders").then(res => res.json()),
  });

  const form = useForm<InsertProductionOrder>({
    resolver: zodResolver(insertProductionOrderSchema.extend({
      dueDate: insertProductionOrderSchema.shape.dueDate.transform(val => new Date(val)),
    })),
    defaultValues: {
      orderNumber: "",
      skuProduct: "",
      customerName: "",
      jobId: "",
      quantity: 0,
      priority: "Medium",
      dueDate: new Date(),
      createdBy: "Admin User",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertProductionOrder) => {
      const response = await fetch("/api/production-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Production order created successfully." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create production order.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProductionOrder) => {
    createOrderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Production Orders</h2>
              <p className="text-gray-600 text-sm mt-1">Manage production orders and scheduling</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-new-order">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Production Order</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Number <span className="text-gray-400">(optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. PO-001" {...field} data-testid="input-order-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skuProduct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU/Product *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sku-product">
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TAB-500MG-100">Coated Tablets 500mg (100 count)</SelectItem>
                              <SelectItem value="CAP-250MG-60">Capsules 250mg (60 count)</SelectItem>
                              <SelectItem value="SYR-125ML">Syrup 125ml Bottle</SelectItem>
                              <SelectItem value="INJ-10ML">Injection 10ml Vial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-customer">
                                <SelectValue placeholder="Select Customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pharma Distributors Inc">Pharma Distributors Inc</SelectItem>
                              <SelectItem value="Healthcare Solutions Ltd">Healthcare Solutions Ltd</SelectItem>
                              <SelectItem value="MedSupply Corp">MedSupply Corp</SelectItem>
                              <SelectItem value="Global Pharma Network">Global Pharma Network</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. JOB-2024-001" {...field} data-testid="input-job-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                              data-testid="input-quantity"
                            />
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
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                              onChange={e => field.onChange(new Date(e.target.value))}
                              data-testid="input-due-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={createOrderMutation.isPending}
                        data-testid="button-create-order"
                      >
                        {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10"
                    data-testid="input-search-orders"
                  />
                </div>
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Order Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">SKU/Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Customer Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Job ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium" data-testid={`text-order-${order.id}`}>
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{order.skuProduct}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{order.customerName}</td>
                          <td className="py-3 px-4 text-sm font-mono text-blue-600">{order.jobId}</td>
                          <td className="py-3 px-4 text-sm">{order.quantity.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm">
                            <Badge className={`${getPriorityColor(order.priority)} text-white`}>
                              {order.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(order.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Button variant="outline" size="sm" data-testid={`button-action-${order.id}`}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}