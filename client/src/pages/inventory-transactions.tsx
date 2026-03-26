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
import type { HandlingUnit, MovementLedgerEntry } from "@shared/schema";
import {
  ArrowDownToLine, Layers, ArrowRightLeft, FlaskConical,
  Factory, ArrowUpFromLine, ShieldAlert, RotateCcw,
  FileText, ScanLine, Scan, ArrowRight, Clock,
} from "lucide-react";

// ─── Movement type config ─────────────────────────────────────────────────────
const MOVEMENT_TYPES = [
  {
    key: "stock_in", label: "Receive Inventory", icon: ArrowDownToLine,
    color: "bg-green-50 border-green-200 hover:bg-green-100", iconColor: "text-green-600", headerColor: "bg-green-600",
    desc: "Receive goods from supplier against a PO or ASN",
    docType: "PO", docLabel: "PO / ASN Number", docPlaceholder: "PO-2024-001 / ASN-001",
    showFrom: false, showTo: true, toLabel: "Receiving Location",
    statusAfter: "available",
  },
  {
    key: "putaway", label: "Putaway", icon: Layers,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100", iconColor: "text-blue-600", headerColor: "bg-blue-600",
    desc: "Move received stock from dock to storage rack / bin",
    docType: "transfer_order", docLabel: "Transfer Order Ref", docPlaceholder: "TO-2024-001",
    showFrom: true, showTo: true, fromLabel: "From (Receiving Dock)", toLabel: "To (Rack / Bin / Shelf)",
    statusAfter: "available",
  },
  {
    key: "internal_transfer", label: "Internal Transfer", icon: ArrowRightLeft,
    color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100", iconColor: "text-indigo-600", headerColor: "bg-indigo-600",
    desc: "Move stock between internal warehouse locations",
    docType: "transfer_order", docLabel: "Transfer Order Ref", docPlaceholder: "TO-INT-001",
    showFrom: true, showTo: true, fromLabel: "From Location", toLabel: "To Location",
    statusAfter: "available",
  },
  {
    key: "issue_to_production", label: "Issue to Production", icon: FlaskConical,
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100", iconColor: "text-amber-600", headerColor: "bg-amber-600",
    desc: "Issue raw materials / packaging to a production order",
    docType: "production_order", docLabel: "Production Order No.", docPlaceholder: "PRD-2024-001",
    showFrom: true, showTo: false, fromLabel: "Issue from Location",
    statusAfter: "in-transit",
  },
  {
    key: "production_receipt", label: "Production Receipt", icon: Factory,
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100", iconColor: "text-teal-600", headerColor: "bg-teal-600",
    desc: "Receive finished goods / semi-finished from production",
    docType: "production_order", docLabel: "Production Order No.", docPlaceholder: "PRD-2024-001",
    showFrom: false, showTo: true, toLabel: "FG Store Destination",
    statusAfter: "available",
  },
  {
    key: "stock_out", label: "Dispatch / Stock Out", icon: ArrowUpFromLine,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100", iconColor: "text-orange-600", headerColor: "bg-orange-600",
    desc: "Ship goods to customer or distribution centre against shipment order",
    docType: "shipment", docLabel: "Shipment / Sales Order No.", docPlaceholder: "SHI-2024-001 / SO-001",
    showFrom: true, showTo: false, fromLabel: "Dispatch from Location",
    statusAfter: "dispatched",
  },
  {
    key: "QC_hold", label: "QC Hold / Release", icon: ShieldAlert,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100", iconColor: "text-purple-600", headerColor: "bg-purple-600",
    desc: "Place or lift a QC hold on a handling unit or batch",
    docType: "QC_transaction", docLabel: "QC / CAPA Reference No.", docPlaceholder: "QC-2024-001 / CAPA-001",
    showFrom: true, showTo: false, fromLabel: "Stock Location",
    statusAfter: "qc-hold",
  },
  {
    key: "cycle_count", label: "Cycle Count", icon: RotateCcw,
    color: "bg-rose-50 border-rose-200 hover:bg-rose-100", iconColor: "text-rose-600", headerColor: "bg-rose-600",
    desc: "Record physical count and post any variance adjustment",
    docType: "cycle_count", docLabel: "Count Sheet / Zone Ref", docPlaceholder: "CNT-2024-001",
    showFrom: true, showTo: false, fromLabel: "Count Zone / Location",
    statusAfter: "available",
  },
];

const STATUS_LABELS: Record<string, string> = {
  available: "Available", "in-transit": "In Transit", dispatched: "Dispatched",
  scrapped: "Scrapped", "on-hold": "On Hold", "qc-hold": "QC Hold",
};

const formSchema = z.object({
  huCode: z.string().min(1, "Select a handling unit"),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.string().min(1, "Enter quantity"),
  uom: z.string().optional(),
  sourceDocNumber: z.string().optional(),
  scanMethod: z.string().default("manual"),
  performedBy: z.string().min(1, "Enter operator name"),
  notes: z.string().optional(),
});
type TxForm = z.infer<typeof formSchema>;

function movTypeBadge(type: string) {
  const cfg = MOVEMENT_TYPES.find(m => m.key === type);
  const colors: Record<string, string> = {
    stock_in: "bg-green-100 text-green-800", putaway: "bg-blue-100 text-blue-800",
    internal_transfer: "bg-indigo-100 text-indigo-800", issue_to_production: "bg-amber-100 text-amber-800",
    production_receipt: "bg-teal-100 text-teal-800", stock_out: "bg-orange-100 text-orange-800",
    QC_hold: "bg-purple-100 text-purple-800", cycle_count: "bg-rose-100 text-rose-800",
  };
  return (
    <Badge className={`border-0 text-xs ${colors[type] ?? "bg-gray-100 text-gray-600"}`}>
      {cfg?.label ?? type.replace(/_/g, " ")}
    </Badge>
  );
}

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function InventoryTransactions() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(MOVEMENT_TYPES[0]);

  const { data: handlingUnits = [] } = useQuery<HandlingUnit[]>({ queryKey: ["/api/traceability/handling-units"] });
  const { data: movements = [], isLoading: loadingMovements } = useQuery<MovementLedgerEntry[]>({ queryKey: ["/api/traceability/movements"] });

  const form = useForm<TxForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: "1", scanMethod: "manual" },
  });

  const selectedHUCode = form.watch("huCode");
  const selectedHU = handlingUnits.find(h => h.huCode === selectedHUCode);

  const postMutation = useMutation({
    mutationFn: async (data: TxForm) => {
      const hu = handlingUnits.find(h => h.huCode === data.huCode);
      return apiRequest("POST", "/api/traceability/movements", {
        movementType: selectedType.key,
        huId: hu?.id,
        huCode: data.huCode,
        huType: hu?.huType,
        materialCode: hu?.materialCode,
        materialName: hu?.materialName,
        batchNumber: data.batchNumber || hu?.batchNumber,
        lotNumber: hu?.lotNumber,
        quantity: data.quantity,
        uom: data.uom || hu?.uom,
        fromLocationCode: data.fromLocation,
        fromLocationName: data.fromLocation,
        toLocationCode: data.toLocation,
        toLocationName: data.toLocation,
        sourceDocType: selectedType.docType,
        sourceDocNumber: data.sourceDocNumber,
        scanMethod: data.scanMethod,
        performedBy: data.performedBy,
        statusBefore: hu?.status,
        statusAfter: selectedType.statusAfter,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      toast({ title: `${selectedType.label} posted to ledger` });
      setDialogOpen(false);
      form.reset({ quantity: "1", scanMethod: "manual" });
    },
    onError: () => toast({ title: "Failed to post movement", variant: "destructive" }),
  });

  function openDialog(mt: typeof MOVEMENT_TYPES[0]) {
    setSelectedType(mt);
    form.reset({ quantity: "1", scanMethod: "manual" });
    setDialogOpen(true);
  }

  const statusCounts = handlingUnits.reduce((acc, h) => { acc[h.status] = (acc[h.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Execute and audit all stock movements — every action is document-driven and written to the movement ledger</p>
          </div>

          {/* Stock status summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Available", value: statusCounts.available ?? 0, color: "text-green-700", bg: "bg-green-50 border-green-200" },
              { label: "In Transit", value: statusCounts["in-transit"] ?? 0, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
              { label: "QC Hold", value: statusCounts["qc-hold"] ?? 0, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
              { label: "On Hold", value: statusCounts["on-hold"] ?? 0, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
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

          {/* Movement type action cards */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Transaction Type to Execute</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOVEMENT_TYPES.map(mt => (
                <button key={mt.key} onClick={() => openDialog(mt)}
                  className={`${mt.color} border rounded-xl p-4 text-left transition-all hover:shadow-md active:scale-[0.99]`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`bg-white rounded-lg p-1.5 shadow-sm`}>
                      <mt.icon className={`h-5 w-5 ${mt.iconColor}`} />
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{mt.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{mt.desc}</p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{mt.docType.replace(/_/g, " ")}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Movement Ledger */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" /> Movement Ledger
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs ml-1">{movements.length} entries</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMovements ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading ledger...</div>
              ) : movements.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No movements yet — post your first transaction above</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Mvt #</TableHead>
                        <TableHead className="text-xs">Movement Type</TableHead>
                        <TableHead className="text-xs">HU Code</TableHead>
                        <TableHead className="text-xs">Material / Batch</TableHead>
                        <TableHead className="text-xs">From → To</TableHead>
                        <TableHead className="text-xs">Source Document</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Scan Method</TableHead>
                        <TableHead className="text-xs">Status Change</TableHead>
                        <TableHead className="text-xs">Performed By</TableHead>
                        <TableHead className="text-xs">Date / Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map(m => (
                        <TableRow key={m.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs font-bold text-blue-700">{m.movementNumber}</TableCell>
                          <TableCell>{movTypeBadge(m.movementType)}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-gray-700">{m.huCode ?? "—"}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs font-medium text-gray-800">{m.materialName ?? m.materialCode ?? "—"}</p>
                              <p className="text-xs text-gray-400 font-mono">{m.batchNumber ?? ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <span className="text-gray-400">{m.fromLocationName || m.fromLocationCode || "—"}</span>
                              {(m.toLocationName || m.toLocationCode) && (
                                <>
                                  <ArrowRight className="h-3 w-3 text-gray-300" />
                                  <span>{m.toLocationName || m.toLocationCode}</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.sourceDocNumber ? (
                              <div>
                                <p className="text-xs font-mono font-semibold text-indigo-700">{m.sourceDocNumber}</p>
                                <p className="text-xs text-gray-400">{(m.sourceDocType ?? "").replace(/_/g, " ")}</p>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{m.quantity} {m.uom ?? ""}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {m.scanMethod === "barcode" ? <Scan className="h-3 w-3 text-green-500" /> :
                               m.scanMethod === "rfid" ? <ScanLine className="h-3 w-3 text-purple-500" /> :
                               <span className="h-3 w-3 text-gray-400 text-xs">M</span>}
                              <span className="text-xs capitalize text-gray-600">{m.scanMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.statusBefore && m.statusAfter ? (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">{STATUS_LABELS[m.statusBefore] ?? m.statusBefore}</span>
                                <ArrowRight className="h-3 w-3 text-gray-300" />
                                <span className={`font-semibold ${m.statusAfter === "available" ? "text-green-700" : m.statusAfter === "qc-hold" ? "text-purple-700" : m.statusAfter === "dispatched" ? "text-gray-500" : "text-blue-700"}`}>
                                  {STATUS_LABELS[m.statusAfter] ?? m.statusAfter}
                                </span>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">{m.performedBy ?? "—"}</TableCell>
                          <TableCell className="text-xs text-gray-400">{fmt(m.movedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) form.reset(); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className={`-mx-6 -mt-6 px-6 py-4 rounded-t-lg ${selectedType.headerColor} text-white mb-2`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <selectedType.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white font-bold">{selectedType.label}</DialogTitle>
                <p className="text-white/80 text-xs mt-0.5">{selectedType.desc}</p>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(d => postMutation.mutate(d))} className="space-y-4">

              {/* Document reference — first and most prominent */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Source Document</p>
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{selectedType.docType.replace(/_/g, " ").toUpperCase()}</Badge>
                </div>
                <FormField control={form.control} name="sourceDocNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-blue-800">{selectedType.docLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={selectedType.docPlaceholder} className="h-9 text-sm font-mono bg-white border-blue-200 focus:border-blue-400" />
                    </FormControl>
                    <p className="text-xs text-blue-600 mt-1">This movement will be traceable to the above document</p>
                  </FormItem>
                )} />
              </div>

              {/* HU selection */}
              <FormField control={form.control} name="huCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Handling Unit (scan barcode or select) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select HU..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {handlingUnits.map(h => (
                        <SelectItem key={h.id} value={h.huCode} className="text-xs">
                          <span className="font-mono font-bold">{h.huCode}</span>
                          {" — "}{h.materialName ?? h.materialCode ?? "Unknown"}
                          {h.batchNumber ? ` (${h.batchNumber})` : ""}
                          {" · "}<span className="text-gray-400">{h.status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Auto-fill info card */}
              {selectedHU && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs grid grid-cols-3 gap-2">
                  <div><span className="text-gray-400">Material:</span> <span className="font-medium">{selectedHU.materialName ?? selectedHU.materialCode ?? "—"}</span></div>
                  <div><span className="text-gray-400">Batch:</span> <span className="font-mono">{selectedHU.batchNumber ?? "—"}</span></div>
                  <div><span className="text-gray-400">Current Status:</span>
                    <span className={`ml-1 font-semibold ${selectedHU.status === "available" ? "text-green-700" : selectedHU.status.includes("hold") ? "text-red-600" : "text-gray-700"}`}>
                      {STATUS_LABELS[selectedHU.status] ?? selectedHU.status}
                    </span>
                  </div>
                  <div><span className="text-gray-400">Location:</span> <span>{selectedHU.currentLocationName ?? selectedHU.currentLocationCode ?? "—"}</span></div>
                  <div><span className="text-gray-400">Qty on hand:</span> <span className="font-semibold">{selectedHU.quantity} {selectedHU.uom}</span></div>
                  <div><span className="text-gray-400">Supplier:</span> <span>{selectedHU.supplierName ?? "—"}</span></div>
                </div>
              )}

              {/* Location fields */}
              <div className="grid grid-cols-2 gap-3">
                {selectedType.showFrom && (
                  <FormField control={form.control} name="fromLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">{selectedType.fromLabel}</FormLabel>
                      <FormControl><Input {...field} placeholder={selectedHU?.currentLocationName ?? "e.g. A-01-R01"} className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                )}
                {selectedType.showTo && (
                  <FormField control={form.control} name="toLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">{selectedType.toLabel}</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. B-02-S04" className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name="batchNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Batch / Lot (if override needed)</FormLabel>
                    <FormControl><Input {...field} placeholder={selectedHU?.batchNumber ?? "BT-2024-001"} className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Quantity *</FormLabel>
                    <FormControl><Input {...field} type="number" min="0.001" step="0.001" className="h-9 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Operator + scan method */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="performedBy" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Performed By / Operator *</FormLabel>
                    <FormControl><Input {...field} placeholder="Operator name / ID" className="h-9 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="scanMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Scan Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="manual" className="text-xs">Manual Entry</SelectItem>
                        <SelectItem value="barcode" className="text-xs">Barcode Scan</SelectItem>
                        <SelectItem value="rfid" className="text-xs">RFID Auto-capture</SelectItem>
                        <SelectItem value="api" className="text-xs">System / API</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notes / Remarks</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" placeholder="Add any operator notes, discrepancies, or exceptions..." /></FormControl>
                </FormItem>
              )} />

              {/* What will happen */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">Effect of this transaction</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-amber-700">
                  <div>HU Status: <span className="font-semibold">{STATUS_LABELS[selectedHU?.status ?? ""] ?? selectedHU?.status ?? "—"}</span>
                    <ArrowRight className="h-3 w-3 inline mx-1 text-amber-400" />
                    <span className="font-bold">{STATUS_LABELS[selectedType.statusAfter] ?? selectedType.statusAfter}</span>
                  </div>
                  <div>Ledger: <span className="font-semibold">New MVT entry created</span></div>
                  <div>Document: <span className="font-semibold">{selectedType.docType.replace(/_/g, " ").toUpperCase()}</span></div>
                  <div>Traceable: <span className="font-semibold text-green-700">Yes — full audit trail</span></div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={postMutation.isPending}
                  className={`text-white ${selectedType.headerColor} hover:opacity-90`}>
                  {postMutation.isPending ? "Posting..." : `Post ${selectedType.label}`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
