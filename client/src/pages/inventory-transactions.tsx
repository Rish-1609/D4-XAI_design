import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { HandlingUnit } from "@shared/schema";
import {
  ArrowDownToLine, Layers, ArrowRightLeft, FlaskConical, Factory,
  ArrowUpFromLine, ShieldAlert, RotateCcw, CheckCircle2, Package,
} from "lucide-react";

const movementTypes = [
  {
    key: "stock_in", label: "Receive Inventory", icon: ArrowDownToLine,
    color: "bg-green-50 border-green-200 hover:bg-green-100", iconColor: "text-green-600",
    desc: "Receive goods from supplier against a PO or ASN",
    fields: { showSource: false, showDest: true, showPO: true, destLabel: "Receiving Location", poLabel: "PO / ASN Reference" },
  },
  {
    key: "putaway", label: "Putaway", icon: Layers,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100", iconColor: "text-blue-600",
    desc: "Move received stock from dock to storage rack / bin",
    fields: { showSource: true, showDest: true, showPO: false, srcLabel: "From (Receiving Dock)", destLabel: "To (Rack / Bin / Shelf)" },
  },
  {
    key: "internal_transfer", label: "Internal Transfer", icon: ArrowRightLeft,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100", iconColor: "text-indigo-600",
    desc: "Move stock between internal warehouse locations",
    fields: { showSource: true, showDest: true, showPO: true, srcLabel: "From Location", destLabel: "To Location", poLabel: "Transfer Order Ref" },
  },
  {
    key: "issue_to_production", label: "Issue to Production", icon: FlaskConical,
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100", iconColor: "text-amber-600",
    desc: "Issue raw materials / packaging to a production order",
    fields: { showSource: true, showDest: false, showPO: true, srcLabel: "Issue from Location", poLabel: "Production Order" },
  },
  {
    key: "production_receipt", label: "Production Receipt", icon: Factory,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100", iconColor: "text-teal-600",
    desc: "Receive finished goods from production into FG store",
    fields: { showSource: false, showDest: true, showPO: true, destLabel: "FG Destination", poLabel: "Production Order" },
  },
  {
    key: "stock_out", label: "Dispatch / Stock Out", icon: ArrowUpFromLine,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100", iconColor: "text-orange-600",
    desc: "Ship goods to customer or distribution centre",
    fields: { showSource: true, showDest: false, showPO: true, srcLabel: "Dispatch from Location", poLabel: "Shipment / SO Reference" },
  },
  {
    key: "QC_hold", label: "QC Hold / Release", icon: ShieldAlert,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100", iconColor: "text-purple-600",
    desc: "Place or lift a QC hold on a batch or handling unit",
    fields: { showSource: true, showDest: false, showPO: true, srcLabel: "Stock Location", poLabel: "QC / CAPA Reference" },
  },
  {
    key: "cycle_count", label: "Cycle Count", icon: RotateCcw,
    color: "bg-rose-50 border-rose-200 hover:bg-rose-100", iconColor: "text-rose-600",
    desc: "Record physical count and post stock adjustment",
    fields: { showSource: true, showDest: false, showPO: false, srcLabel: "Count Zone / Location" },
  },
];

const movementSchema = z.object({
  movementType: z.string().min(1),
  huCode: z.string().min(1, "Select or enter a handling unit"),
  sourceLocation: z.string().optional(),
  destinationLocation: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.string().min(1, "Enter quantity"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
type MovementForm = z.infer<typeof movementSchema>;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    "in-transit": "bg-blue-100 text-blue-800",
    dispatched: "bg-gray-100 text-gray-600",
    "on-hold": "bg-orange-100 text-orange-800",
    "qc-hold": "bg-purple-100 text-purple-800",
    scrapped: "bg-red-100 text-red-700",
  };
  return <Badge className={`${map[status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>{(status ?? "").replace(/-/g, " ")}</Badge>;
}

export default function InventoryTransactions() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(movementTypes[0]);

  const { data: handlingUnits = [] } = useQuery<HandlingUnit[]>({
    queryKey: ["/api/traceability/handling-units"],
  });

  const form = useForm<MovementForm>({
    resolver: zodResolver(movementSchema),
    defaultValues: { movementType: "stock_in", quantity: "1" },
  });

  const movMutation = useMutation({
    mutationFn: (data: MovementForm) => {
      const newStatus =
        data.movementType === "QC_hold" ? "qc-hold" :
        data.movementType === "stock_out" ? "dispatched" :
        data.movementType === "issue_to_production" ? "in-transit" : "available";
      return apiRequest("PUT", `/api/traceability/handling-units/${handlingUnits.find(h => h.huCode === data.huCode)?.id ?? ""}`, {
        status: newStatus,
        currentLocationCode: data.destinationLocation || data.sourceLocation,
        currentLocationName: data.destinationLocation || data.sourceLocation,
        notes: `[${data.movementType.replace(/_/g, " ").toUpperCase()}] Ref: ${data.reference ?? "—"} | ${data.notes ?? ""}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      toast({ title: "Movement logged and stock updated" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to log movement", variant: "destructive" }),
  });

  function openDialog(mt: typeof movementTypes[0]) {
    setSelectedType(mt);
    form.setValue("movementType", mt.key);
    setDialogOpen(true);
  }

  const recentActivity = [...handlingUnits].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  const statusCounts = handlingUnits.reduce((acc, h) => { acc[h.status] = (acc[h.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const f = selectedType.fields;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Log and track all inventory movements — receipt, putaway, transfer, issue, dispatch, and count</p>
          </div>

          {/* Stock status summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Available", value: statusCounts.available ?? 0, color: "text-green-600", bg: "bg-green-50 border-green-200" },
              { label: "In Transit", value: statusCounts["in-transit"] ?? 0, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
              { label: "QC Hold", value: statusCounts["qc-hold"] ?? 0, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
              { label: "On Hold", value: statusCounts["on-hold"] ?? 0, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
              { label: "Dispatched", value: statusCounts.dispatched ?? 0, color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
              { label: "Total HUs", value: handlingUnits.length, color: "text-gray-800", bg: "bg-white border-gray-200" },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Movement type cards */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" /> Select Movement Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {movementTypes.map(mt => (
                <button key={mt.key} onClick={() => openDialog(mt)}
                  className={`${mt.color} border rounded-xl p-4 text-left transition-all hover:shadow-sm`}>
                  <mt.icon className={`h-7 w-7 ${mt.iconColor} mb-2.5`} />
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{mt.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{mt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" /> Stock Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">HU Code</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Material</TableHead>
                    <TableHead className="text-xs">Batch</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map(hu => (
                    <TableRow key={hu.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-xs font-bold text-blue-700">{hu.huCode}</TableCell>
                      <TableCell className="text-xs capitalize">{hu.huType}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium">{hu.materialName ?? "—"}</p>
                          <p className="text-xs text-gray-400">{hu.materialCode ?? ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">{hu.batchNumber ?? "—"}</TableCell>
                      <TableCell className="text-xs text-gray-500">{hu.currentLocationName ?? hu.currentLocationCode ?? "—"}</TableCell>
                      <TableCell className="text-xs font-semibold">{hu.quantity} {hu.uom}</TableCell>
                      <TableCell>{statusBadge(hu.status)}</TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {hu.updatedAt ? new Date(hu.updatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) form.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <selectedType.icon className={`h-5 w-5 ${selectedType.iconColor}`} />
              {selectedType.label}
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">{selectedType.desc}</p>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(d => movMutation.mutate(d))} className="space-y-3">
              <FormField control={form.control} name="huCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Handling Unit (scan or select) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select HU..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {handlingUnits.map(h => (
                        <SelectItem key={h.id} value={h.huCode} className="text-xs">
                          {h.huCode} — {h.materialName ?? h.materialCode ?? "Unknown"}
                          {h.batchNumber ? ` (${h.batchNumber})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                {f.showSource && (
                  <FormField control={form.control} name="sourceLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{f.srcLabel ?? "Source Location"}</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. A-01-R01" className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                )}
                {f.showDest && (
                  <FormField control={form.control} name="destinationLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{f.destLabel ?? "Destination Location"}</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. C-01-S01" className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="batchNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Batch / Lot</FormLabel>
                    <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Quantity *</FormLabel>
                    <FormControl><Input {...field} type="number" min="0.01" className="h-9 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {f.showPO && (
                <FormField control={form.control} name="reference" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{f.poLabel ?? "Reference Document"}</FormLabel>
                    <FormControl><Input {...field} placeholder="PO-2024-001 / PRD-001 / SO-001..." className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notes / Remarks</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" placeholder="Add any operator notes..." /></FormControl>
                </FormItem>
              )} />

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium mb-1">What will happen</p>
                <p className="text-xs text-gray-600">
                  {selectedType.key === "QC_hold" && "Stock status will be set to QC Hold. It cannot be issued or shipped until released."}
                  {selectedType.key === "stock_out" && "Stock status will be set to Dispatched. Location will be cleared."}
                  {selectedType.key === "issue_to_production" && "Stock status will be set to In Transit. Location updated to production floor."}
                  {selectedType.key === "stock_in" && "New stock will be received into the system at the destination location."}
                  {selectedType.key === "putaway" && "HU will be moved from receiving area to the specified storage location."}
                  {selectedType.key === "internal_transfer" && "Stock location will be updated from source to destination."}
                  {selectedType.key === "production_receipt" && "Finished goods will be received into the FG storage location."}
                  {selectedType.key === "cycle_count" && "A count adjustment note will be recorded against this HU."}
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={movMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {movMutation.isPending ? "Posting..." : "Post Movement"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
