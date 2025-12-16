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
import { Plus, ArrowUp, ArrowDown, RefreshCw, Calendar } from "lucide-react";
import type { InventoryItem, InventoryTransaction } from "@shared/schema";

type StockMovement = InventoryTransaction;
type StockMovementFormData = {
  inventoryItemId: string;
  type: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  referenceNumber: string;
  user: string;
  qualityIssue?: string;
  notes?: string;
};

export default function StockMovements() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch stock movements
  const { data: stockMovements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ["/api/stock-movements"],
  });

  // Fetch inventory items for dropdown
  const { data: inventoryItems = [] as InventoryItem[] } = useQuery({
    queryKey: ["/api/inventory-items"],
  });

  // Form schema for stock movements
  const stockMovementFormSchema = z.object({
    inventoryItemId: z.string().min(1, "Item is required"),
    type: z.string().min(1, "Type is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    referenceNumber: z.string().optional(),
    user: z.string().min(1, "User is required"),
    qualityIssue: z.string().optional(),
    notes: z.string().optional(),
    movementDate: z.any().optional(),
  });

  // Form setup
  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: {
      inventoryItemId: "",
      type: "IN",
      quantity: 0,
      fromLocation: "",
      toLocation: "",
      referenceNumber: "",
      user: "user@example.com",
      qualityIssue: "",
      notes: "",
    },
  });

  // Mutation for creating stock movement
  const createMutation = useMutation({
    mutationFn: (data: StockMovementFormData) => {
      // Convert date string to Date object
      const processedData = {
        ...data,
        movementDate: new Date(data.movementDate!),
        quantity: Math.abs(data.quantity), // Ensure positive quantity
      };
      return apiRequest("/api/stock-movements", "POST", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stats"] });
      toast({ title: "Success", description: "Stock movement recorded successfully" });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record stock movement", variant: "destructive" });
    },
  });

  const handleSubmit = (data: StockMovementFormData) => {
    createMutation.mutate(data);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "OUT":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "ADJUSTMENT":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "IN":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" data-testid="badge-in">Stock In</Badge>;
      case "OUT":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" data-testid="badge-out">Stock Out</Badge>;
      case "ADJUSTMENT":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" data-testid="badge-adjustment">Adjustment</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-other">Other</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInventoryItemName = (itemId: string) => {
    const item = (inventoryItems as InventoryItem[]).find((item: InventoryItem) => item.id === itemId);
    return item ? `${item.itemCode} - ${item.name}` : itemId;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Stock Movements</h2>
              <p className="text-gray-600 text-sm mt-1">Track all inventory movements including stock in, stock out, and adjustments</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-full" data-testid="page-stock-movements">
      <div className="flex justify-between items-center mb-6">
        <div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => form.reset()}
              data-testid="button-add-movement"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="modal-movement-form">
            <DialogHeader>
              <DialogTitle data-testid="title-modal">Record Stock Movement</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="inventoryItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Item</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-inventory-item">
                            <SelectValue placeholder="Select inventory item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(inventoryItems as InventoryItem[]).map((item: InventoryItem) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.itemCode} - {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-movement-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">Stock In</SelectItem>
                          <SelectItem value="OUT">Stock Out</SelectItem>
                          <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="0.01"
                          step="0.01"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="fromLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-from-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control as any}
                    name="toLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Location</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} data-testid="input-to-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., PO-001, WO-001" value={field.value ?? ""} data-testid="input-reference-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="movementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          value={field.value ? (typeof field.value === 'string' ? field.value : field.value.toISOString().split('T')[0]) : ""}
                          data-testid="input-movement-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="qualityIssue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Issue (if any)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} data-testid="input-quality-issue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} value={field.value ?? ""} data-testid="textarea-notes" />
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
                    disabled={createMutation.isPending}
                    data-testid="button-save-movement"
                  >
                    {createMutation.isPending ? "Recording..." : "Record Movement"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Movements Table */}
      <Card data-testid="card-movements-table">
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {movementsLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              ))}
            </div>
          ) : (stockMovements as StockMovement[]).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="text-no-movements">
              No stock movements recorded yet. Record your first movement to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-testid="table-stock-movements">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stockMovements as StockMovement[]).map((movement: StockMovement) => (
                    <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                      <TableCell className="font-medium" data-testid={`cell-date-${movement.id}`}>
                        {formatDateTime(movement.movementDate! as any)}
                      </TableCell>
                      <TableCell data-testid={`cell-item-${movement.id}`}>
                        {getInventoryItemName(movement.inventoryItemId)}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${movement.id}`}>
                        <div className="flex items-center space-x-2">
                          {getMovementIcon(movement.type)}
                          {getMovementBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`cell-quantity-${movement.id}`}>
                        <span className={movement.type === 'OUT' ? 'text-red-600' : 'text-green-600'}>
                          {movement.type === 'OUT' ? '-' : '+'}{movement.quantity.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`cell-from-${movement.id}`}>
                        {movement.fromLocation || "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-to-${movement.id}`}>
                        {movement.toLocation || "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-reference-${movement.id}`}>
                        {movement.referenceNumber || "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-user-${movement.id}`}>
                        {movement.user}
                      </TableCell>
                      <TableCell data-testid={`cell-notes-${movement.id}`}>
                        {movement.notes || "—"}
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