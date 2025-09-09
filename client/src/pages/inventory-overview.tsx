import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, AlertTriangle, TrendingDown, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import type { InventoryItem } from "@shared/schema";
import { insertInventoryItemSchema } from "@shared/schema";

type InventoryFormData = z.infer<typeof insertInventoryItemSchema>;

export default function InventoryOverview() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch inventory statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/inventory-stats"],
  });

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/inventory-items"],
  });

  // Form setup
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      itemCode: "",
      name: "",
      category: "",
      type: "",
      supplierName: "",
      warehouseLocation: "",
      batchNumber: "",
      currentStock: 0,
      minimumLevel: 0,
      maximumLevel: 100,
      moq: 1,
      uom: "KG",
      rate: 0,
      leadTimeDays: 7,
      specification: "",
      status: "Active",
      qualityStatus: "Passed",
      createdBy: "user",
    },
  });

  // Mutation for creating/updating inventory items
  const createMutation = useMutation({
    mutationFn: (data: InventoryFormData) => apiRequest("/api/inventory-items", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stats"] });
      toast({ title: "Success", description: "Inventory item created successfully" });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create inventory item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryFormData> }) => 
      apiRequest(`/api/inventory-items/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stats"] });
      toast({ title: "Success", description: "Inventory item updated successfully" });
      form.reset();
      setSelectedItem(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inventory item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/inventory-items/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stats"] });
      toast({ title: "Success", description: "Inventory item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete inventory item", variant: "destructive" });
    },
  });

  const handleSubmit = (data: InventoryFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    form.reset({
      itemCode: item.itemCode,
      name: item.name,
      category: item.category,
      type: item.type,
      supplierName: item.supplierName ?? "",
      warehouseLocation: item.warehouseLocation ?? "",
      batchNumber: item.batchNumber ?? "",
      currentStock: item.currentStock,
      minimumLevel: item.minimumLevel,
      maximumLevel: item.maximumLevel,
      moq: item.moq,
      uom: item.uom,
      rate: item.rate,
      leadTimeDays: item.leadTimeDays ?? 7,
      specification: item.specification ?? "",
      status: item.status,
      qualityStatus: item.qualityStatus || "Passed",
      createdBy: item.createdBy,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amountInPaise: number) => {
    return `₹${(amountInPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return <Badge variant="destructive" data-testid="badge-out-of-stock">Out of Stock</Badge>;
    } else if (item.currentStock <= item.minimumLevel) {
      return <Badge variant="secondary" data-testid="badge-low-stock">Low Stock</Badge>;
    } else {
      return <Badge variant="default" data-testid="badge-in-stock">In Stock</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Inventory Management</h2>
              <p className="text-gray-600 text-sm mt-1">Track and manage inventory items, stock levels, and movements</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-full" data-testid="page-inventory-overview">
      <div className="flex justify-between items-center mb-6">
        <div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setSelectedItem(null);
                form.reset();
              }}
              data-testid="button-add-item"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-inventory-form">
            <DialogHeader>
              <DialogTitle data-testid="title-modal">
                {selectedItem ? "Edit Inventory Item" : "Add New Inventory Item"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-item-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-item-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-supplier-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="warehouseLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-warehouse-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-batch-number" />
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
                        <FormLabel>Unit of Measure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-uom">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="PCS">PCS</SelectItem>
                            <SelectItem value="BOX">BOX</SelectItem>
                            <SelectItem value="UNIT">UNIT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-current-stock"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minimumLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Level</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-minimum-level"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maximumLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Level</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-maximum-level"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-moq"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate (in paise)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-rate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leadTimeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Time (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            value={field.value ?? 0}
                            data-testid="input-lead-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualityStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-quality-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Passed">Passed</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="specification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specification</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} value={field.value ?? ""} data-testid="textarea-specification" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-item"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Saving..." 
                      : selectedItem ? "Update Item" : "Create Item"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-items">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-items">
                {(stats as any)?.totalItems ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">inventory items</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-value">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-value">
                {formatCurrency((stats as any)?.totalValue ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">inventory value</p>
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-low-stock">
                {(stats as any)?.lowStockItems ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">need reordering</p>
            </CardContent>
          </Card>

          <Card data-testid="card-out-of-stock">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-out-of-stock">
                {(stats as any)?.outOfStockItems ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">items unavailable</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Items Table */}
      <Card data-testid="card-inventory-table">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              ))}
            </div>
          ) : (inventoryItems as InventoryItem[]).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="text-no-items">
              No inventory items found. Add your first inventory item to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-testid="table-inventory-items">
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inventoryItems as InventoryItem[]).map((item: InventoryItem) => (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell className="font-medium" data-testid={`cell-code-${item.id}`}>
                        {item.itemCode}
                      </TableCell>
                      <TableCell data-testid={`cell-name-${item.id}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-category-${item.id}`}>{item.category}</TableCell>
                      <TableCell data-testid={`cell-supplier-${item.id}`}>
                        {item.supplierName ?? "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-stock-${item.id}`}>
                        {item.currentStock.toLocaleString()}
                      </TableCell>
                      <TableCell data-testid={`cell-uom-${item.id}`}>{item.uom}</TableCell>
                      <TableCell data-testid={`cell-rate-${item.id}`}>
                        {formatCurrency(item.rate)}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${item.id}`}>
                        <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-stock-status-${item.id}`}>
                        {getStockStatusBadge(item)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </div>
  );
}