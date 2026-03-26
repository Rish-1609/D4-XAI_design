import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { HandlingUnit, Barcode, ScanException, RfidReader, RfidZone, RfidTag, RfidEvent } from "@shared/schema";
import {
  Package, Tag, QrCode, Truck, ArrowRightLeft, FlaskConical, Factory, ShieldAlert,
  RotateCcw, CheckCircle2, AlertTriangle, Activity, Wifi, WifiOff, Radio,
  MapPin, Search, Plus, Eye, RefreshCw, XCircle, ChevronRight, BarChart3,
  ArrowDownToLine, ArrowUpFromLine, MoveRight, Layers, Zap,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    "in-transit": "bg-blue-100 text-blue-800",
    dispatched: "bg-gray-100 text-gray-700",
    scrapped: "bg-red-100 text-red-700",
    "on-hold": "bg-orange-100 text-orange-800",
    "qc-hold": "bg-purple-100 text-purple-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-600",
    reprinted: "bg-yellow-100 text-yellow-800",
    open: "bg-red-100 text-red-700",
    resolved: "bg-green-100 text-green-800",
    ignored: "bg-gray-100 text-gray-500",
    online: "bg-green-100 text-green-800",
    offline: "bg-red-100 text-red-700",
    maintenance: "bg-yellow-100 text-yellow-800",
  };
  return (
    <Badge className={`${map[status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs font-medium`}>
      {(status ?? "").replace(/-/g, " ")}
    </Badge>
  );
}

function exceptionTypeBadge(t: string) {
  const labels: Record<string, string> = {
    unknown_tag: "Unknown Tag",
    wrong_location: "Wrong Location",
    wrong_batch: "Wrong Batch",
    duplicate_scan: "Duplicate Scan",
    no_shipment: "No Shipment",
    hold_violation: "Hold Violation",
    inactive_tag: "Inactive Tag",
    quantity_mismatch: "Qty Mismatch",
  };
  const colors: Record<string, string> = {
    unknown_tag: "bg-gray-100 text-gray-700",
    wrong_location: "bg-blue-100 text-blue-800",
    wrong_batch: "bg-yellow-100 text-yellow-800",
    duplicate_scan: "bg-orange-100 text-orange-700",
    no_shipment: "bg-purple-100 text-purple-700",
    hold_violation: "bg-red-100 text-red-700",
    inactive_tag: "bg-gray-100 text-gray-500",
    quantity_mismatch: "bg-pink-100 text-pink-700",
  };
  return (
    <Badge className={`${colors[t] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>
      {labels[t] ?? t}
    </Badge>
  );
}

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── movement schema ───────────────────────────────────────────────────────────
const movementSchema = z.object({
  movementType: z.string().min(1, "Select a movement type"),
  huCode: z.string().min(1, "HU code is required"),
  sourceLocation: z.string().optional(),
  destinationLocation: z.string().optional(),
  materialCode: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
type MovementForm = z.infer<typeof movementSchema>;

// ── HU schema ─────────────────────────────────────────────────────────────────
const huSchema = z.object({
  huCode: z.string().min(1, "HU code required"),
  huType: z.string().min(1, "Select type"),
  materialCode: z.string().optional(),
  materialName: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.string().optional(),
  uom: z.string().optional(),
  currentLocationCode: z.string().optional(),
  currentLocationName: z.string().optional(),
  barcodeValue: z.string().optional(),
  rfidEpc: z.string().optional(),
  supplierName: z.string().optional(),
  notes: z.string().optional(),
});
type HUForm = z.infer<typeof huSchema>;

const movementTypes = [
  { key: "stock_in", label: "Receive Inventory", icon: ArrowDownToLine, color: "bg-green-50 border-green-200 hover:bg-green-100", iconColor: "text-green-600", desc: "Receive goods from supplier or inbound transfer" },
  { key: "putaway", label: "Putaway", icon: Layers, color: "bg-blue-50 border-blue-200 hover:bg-blue-100", iconColor: "text-blue-600", desc: "Move received stock to storage location" },
  { key: "internal_transfer", label: "Internal Transfer", icon: ArrowRightLeft, color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100", iconColor: "text-indigo-600", desc: "Move stock between internal locations" },
  { key: "issue_to_production", label: "Issue to Production", icon: FlaskConical, color: "bg-amber-50 border-amber-200 hover:bg-amber-100", iconColor: "text-amber-600", desc: "Issue raw materials to production order" },
  { key: "production_receipt", label: "Production Receipt", icon: Factory, color: "bg-teal-50 border-teal-200 hover:bg-teal-100", iconColor: "text-teal-600", desc: "Receive finished goods from production" },
  { key: "stock_out", label: "Dispatch / Stock Out", icon: ArrowUpFromLine, color: "bg-orange-50 border-orange-200 hover:bg-orange-100", iconColor: "text-orange-600", desc: "Ship goods outbound to customer or distribution" },
  { key: "QC_hold", label: "QC Hold / Release", icon: ShieldAlert, color: "bg-purple-50 border-purple-200 hover:bg-purple-100", iconColor: "text-purple-600", desc: "Place or release QC hold on material" },
  { key: "cycle_count_adjustment", label: "Cycle Count", icon: RotateCcw, color: "bg-rose-50 border-rose-200 hover:bg-rose-100", iconColor: "text-rose-600", desc: "Record physical count and post adjustment" },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function InventoryTraceability() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");
  const [movementOpen, setMovementOpen] = useState(false);
  const [selectedMovType, setSelectedMovType] = useState<string>("");
  const [huDialogOpen, setHuDialogOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState<ScanException | null>(null);
  const [huFilter, setHuFilter] = useState("");
  const [bcFilter, setBcFilter] = useState("");

  // ── API queries ─────────────────────────────────────────────────────────────
  const { data: stats } = useQuery<{ totalHUs: number; activeBarcodes: number; openExceptions: number; totalMovements: number }>({
    queryKey: ["/api/traceability/stats"],
  });
  const { data: handlingUnits = [], isLoading: loadingHUs } = useQuery<HandlingUnit[]>({
    queryKey: ["/api/traceability/handling-units"],
  });
  const { data: barcodes = [], isLoading: loadingBarcodes } = useQuery<Barcode[]>({
    queryKey: ["/api/traceability/barcodes"],
  });
  const { data: exceptions = [], isLoading: loadingEx } = useQuery<ScanException[]>({
    queryKey: ["/api/traceability/exceptions"],
  });
  const { data: rfidReaders = [] } = useQuery<RfidReader[]>({ queryKey: ["/api/rfid/readers"] });
  const { data: rfidZones = [] } = useQuery<RfidZone[]>({ queryKey: ["/api/rfid/zones"] });
  const { data: rfidTags = [] } = useQuery<RfidTag[]>({ queryKey: ["/api/rfid/tags"] });
  const { data: rfidEvents = [] } = useQuery<RfidEvent[]>({ queryKey: ["/api/rfid/events"] });
  const { data: rfidStats } = useQuery<{ totalReaders: number; onlineReaders: number; activeTags: number; todayEvents: number; inboundToday: number; outboundToday: number }>({ queryKey: ["/api/rfid/stats"] });

  // ── mutations ───────────────────────────────────────────────────────────────
  const movementForm = useForm<MovementForm>({ resolver: zodResolver(movementSchema), defaultValues: { movementType: "", huCode: "", quantity: "1" } });
  const huForm = useForm<HUForm>({ resolver: zodResolver(huSchema), defaultValues: { huType: "pallet", uom: "units", quantity: "1" } });

  const movementMutation = useMutation({
    mutationFn: (data: MovementForm) => apiRequest("POST", "/api/traceability/handling-units", {
      huCode: data.huCode + "-MOV",
      huType: "pallet",
      materialCode: data.materialCode,
      batchNumber: data.batchNumber,
      quantity: data.quantity || "1",
      currentLocationCode: data.destinationLocation || data.sourceLocation,
      currentLocationName: data.destinationLocation || data.sourceLocation,
      notes: `${data.movementType.replace(/_/g, " ").toUpperCase()} | Ref: ${data.reference || "n/a"} | ${data.notes || ""}`,
      status: data.movementType === "QC_hold" ? "qc-hold" : data.movementType === "stock_out" ? "dispatched" : data.movementType === "issue_to_production" ? "in-transit" : "available",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Movement logged successfully" });
      setMovementOpen(false);
      movementForm.reset();
    },
    onError: () => toast({ title: "Failed to log movement", variant: "destructive" }),
  });

  const createHUMutation = useMutation({
    mutationFn: (data: HUForm) => apiRequest("POST", "/api/traceability/handling-units", { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/handling-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Handling unit created" });
      setHuDialogOpen(false);
      huForm.reset();
    },
    onError: () => toast({ title: "Failed to create handling unit", variant: "destructive" }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolvedBy, notes }: { id: string; resolvedBy: string; notes: string }) =>
      apiRequest("PUT", `/api/traceability/exceptions/${id}/resolve`, { resolvedBy, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Exception resolved" });
      setResolveOpen(false);
      setSelectedEx(null);
    },
    onError: () => toast({ title: "Failed to resolve exception", variant: "destructive" }),
  });

  function openMovement(type: string) {
    setSelectedMovType(type);
    movementForm.setValue("movementType", type);
    setMovementOpen(true);
  }

  const filteredHUs = handlingUnits.filter(h =>
    !huFilter || h.huCode.toLowerCase().includes(huFilter.toLowerCase()) ||
    (h.materialName ?? "").toLowerCase().includes(huFilter.toLowerCase()) ||
    (h.batchNumber ?? "").toLowerCase().includes(huFilter.toLowerCase())
  );
  const filteredBCs = barcodes.filter(b =>
    !bcFilter || b.barcodeValue.toLowerCase().includes(bcFilter.toLowerCase()) ||
    (b.materialCode ?? "").toLowerCase().includes(bcFilter.toLowerCase())
  );

  const statusCounts = { available: 0, "in-transit": 0, "qc-hold": 0, "on-hold": 0 } as Record<string, number>;
  handlingUnits.forEach(h => { statusCounts[h.status] = (statusCounts[h.status] || 0) + 1; });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Traceability</h1>
              <p className="text-sm text-gray-500 mt-0.5">Unified barcode + RFID tracking — from receipt to dispatch</p>
            </div>
            <Button onClick={() => setHuDialogOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> New Handling Unit
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Handling Units", value: stats?.totalHUs ?? handlingUnits.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Active Barcodes", value: stats?.activeBarcodes ?? barcodes.filter(b => b.status === "active").length, icon: QrCode, color: "text-green-600", bg: "bg-green-50" },
              { label: "Open Exceptions", value: stats?.openExceptions ?? exceptions.filter(e => e.resolvedStatus === "open").length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
              { label: "RFID Online", value: rfidStats?.onlineReaders ?? 0, icon: Radio, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(s => (
              <Card key={s.label} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${s.bg} rounded-lg p-2`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* HU status pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {Object.entries(statusCounts).filter(([, v]) => v > 0).map(([status, count]) => (
              <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                status === "available" ? "bg-green-50 border-green-200 text-green-700" :
                status === "in-transit" ? "bg-blue-50 border-blue-200 text-blue-700" :
                status === "qc-hold" ? "bg-purple-50 border-purple-200 text-purple-700" :
                "bg-orange-50 border-orange-200 text-orange-700"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {count} {status.replace("-", " ")}
              </span>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-gray-200 p-1 mb-6">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Transactions</TabsTrigger>
              <TabsTrigger value="traceability" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Traceability</TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">RFID Monitoring</TabsTrigger>
              <TabsTrigger value="exceptions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">
                Exceptions {exceptions.filter(e => e.resolvedStatus === "open").length > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{exceptions.filter(e => e.resolvedStatus === "open").length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ledger" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs px-4">Ledger</TabsTrigger>
            </TabsList>

            {/* ── TAB: TRANSACTIONS ────────────────────────────────────────── */}
            <TabsContent value="transactions" className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Log Inventory Movement</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {movementTypes.map(m => (
                    <button key={m.key} onClick={() => openMovement(m.key)}
                      className={`${m.color} border rounded-xl p-4 text-left transition-all group`}>
                      <m.icon className={`h-6 w-6 ${m.iconColor} mb-2`} />
                      <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Handling Unit activity */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800">Recent Handling Units</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingHUs ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                  ) : (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {handlingUnits.slice(0, 10).map(hu => (
                          <TableRow key={hu.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-semibold text-blue-700">{hu.huCode}</TableCell>
                            <TableCell className="text-xs capitalize">{hu.huType}</TableCell>
                            <TableCell className="text-xs">{hu.materialName ?? hu.materialCode ?? "—"}</TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">{hu.batchNumber ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{hu.currentLocationName ?? hu.currentLocationCode ?? "—"}</TableCell>
                            <TableCell className="text-xs">{hu.quantity} {hu.uom}</TableCell>
                            <TableCell>{statusBadge(hu.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: TRACEABILITY ────────────────────────────────────────── */}
            <TabsContent value="traceability" className="space-y-6">
              {/* Handling Units full table */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" /> Handling Unit Registry
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                        <Input value={huFilter} onChange={e => setHuFilter(e.target.value)}
                          placeholder="Search HU / material / batch..." className="pl-8 h-8 text-xs w-56" />
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setHuDialogOpen(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Add HU
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">HU Code</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Material</TableHead>
                        <TableHead className="text-xs">Batch / Lot</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Location</TableHead>
                        <TableHead className="text-xs">Barcode</TableHead>
                        <TableHead className="text-xs">RFID EPC</TableHead>
                        <TableHead className="text-xs">Supplier</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHUs.map(hu => (
                        <TableRow key={hu.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs font-bold text-blue-700">{hu.huCode}</TableCell>
                          <TableCell>
                            <Badge className={`border-0 text-xs ${hu.huType === "pallet" ? "bg-blue-50 text-blue-700" : hu.huType === "carton" ? "bg-indigo-50 text-indigo-700" : hu.huType === "tote" ? "bg-teal-50 text-teal-700" : "bg-gray-50 text-gray-700"}`}>
                              {hu.huType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{hu.materialName ?? hu.materialCode ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-600">{hu.batchNumber ?? "—"}{hu.lotNumber ? ` / ${hu.lotNumber}` : ""}</TableCell>
                          <TableCell className="text-xs font-semibold">{hu.quantity} {hu.uom}</TableCell>
                          <TableCell className="text-xs text-gray-500">{hu.currentLocationName ?? hu.currentLocationCode ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-green-700">{hu.barcodeValue ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-purple-600 max-w-[120px] truncate">{hu.rfidEpc ?? "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{hu.supplierName ?? "—"}</TableCell>
                          <TableCell>{statusBadge(hu.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Barcode Registry */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-green-600" /> Barcode Registry
                    </CardTitle>
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                      <Input value={bcFilter} onChange={e => setBcFilter(e.target.value)}
                        placeholder="Search barcode / material..." className="pl-8 h-8 text-xs w-52" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Barcode Value</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Linked HU</TableHead>
                        <TableHead className="text-xs">Material Code</TableHead>
                        <TableHead className="text-xs">Batch</TableHead>
                        <TableHead className="text-xs">Label</TableHead>
                        <TableHead className="text-xs">Printed By</TableHead>
                        <TableHead className="text-xs">Printed At</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBCs.map(bc => (
                        <TableRow key={bc.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs font-bold text-green-700">{bc.barcodeValue}</TableCell>
                          <TableCell>
                            <Badge className={`border-0 text-xs ${bc.barcodeType === "HU" ? "bg-green-50 text-green-700" : bc.barcodeType === "location" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}>
                              {bc.barcodeType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-blue-700">{bc.linkedHuCode ?? "—"}</TableCell>
                          <TableCell className="text-xs font-medium">{bc.materialCode ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-gray-600">{bc.batchNumber ?? "—"}</TableCell>
                          <TableCell className="text-xs capitalize">{bc.labelType ?? "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{bc.printedBy ?? "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{fmt(bc.printedAt)}</TableCell>
                          <TableCell>{statusBadge(bc.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: RFID MONITORING ─────────────────────────────────────── */}
            <TabsContent value="monitoring" className="space-y-6">
              {/* RFID Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Total Readers", value: rfidStats?.totalReaders ?? rfidReaders.length },
                  { label: "Online", value: rfidStats?.onlineReaders ?? rfidReaders.filter(r => r.status === "online").length },
                  { label: "Active Tags", value: rfidStats?.activeTags ?? rfidTags.filter(t => t.status === "active").length },
                  { label: "Events Today", value: rfidStats?.todayEvents ?? 0 },
                  { label: "Inbound Today", value: rfidStats?.inboundToday ?? 0 },
                  { label: "Outbound Today", value: rfidStats?.outboundToday ?? 0 },
                ].map(s => (
                  <Card key={s.label} className="border border-gray-200">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Readers health + Zone map side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Radio className="h-4 w-4 text-blue-600" /> Reader Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {rfidReaders.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2">
                          {r.status === "online" ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{r.readerCode}</p>
                            <p className="text-xs text-gray-400">{r.vendor} {r.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {statusBadge(r.status)}
                          <p className="text-xs text-gray-400 mt-0.5">{r.ipAddress ?? "—"}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" /> Zone Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {rfidZones.map(z => {
                      const zoneReaders = rfidReaders.filter(r => r.zoneId === z.id);
                      const zoneEvents = rfidEvents.filter(e => e.zoneId === z.id);
                      return (
                        <div key={z.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{z.name}</p>
                            <p className="text-xs text-gray-400">{z.zoneCode} · {z.type}</p>
                          </div>
                          <div className="flex gap-2 text-right items-center">
                            <span className="text-xs text-gray-500">{zoneReaders.length} readers</span>
                            <span className="text-xs text-gray-500">{zoneEvents.length} events</span>
                            <Badge className={`border-0 text-xs ${z.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                              {z.isActive ? "active" : "inactive"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Recent scan events */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" /> Live Scan Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Time</TableHead>
                        <TableHead className="text-xs">Event</TableHead>
                        <TableHead className="text-xs">EPC / Tag</TableHead>
                        <TableHead className="text-xs">Reader</TableHead>
                        <TableHead className="text-xs">Zone</TableHead>
                        <TableHead className="text-xs">RSSI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidEvents.slice(0, 15).map(ev => {
                        const reader = rfidReaders.find(r => r.id === ev.readerId);
                        const zone = rfidZones.find(z => z.id === ev.zoneId);
                        const tag = rfidTags.find(t => t.id === ev.tagId);
                        return (
                          <TableRow key={ev.id} className="hover:bg-gray-50">
                            <TableCell className="text-xs text-gray-500">{fmt(ev.scannedAt)}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${ev.eventType === "inbound" ? "bg-green-50 text-green-700" : ev.eventType === "outbound" ? "bg-orange-50 text-orange-700" : ev.eventType === "zone-transfer" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>
                                {ev.eventType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-purple-700">{tag?.tagEpc ?? ev.tagEpc ?? ev.tagId}</TableCell>
                            <TableCell className="text-xs">{reader?.readerCode ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{zone?.name ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{ev.rssi ?? "—"} dBm</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Tag Registry */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" /> RFID Tag Registry
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">EPC Code</TableHead>
                        <TableHead className="text-xs">Material Type</TableHead>
                        <TableHead className="text-xs">Batch / Lot</TableHead>
                        <TableHead className="text-xs">Current Zone</TableHead>
                        <TableHead className="text-xs">Last Reader</TableHead>
                        <TableHead className="text-xs">RSSI</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfidTags.map(tag => {
                        const lastEvent = rfidEvents.filter(e => e.tagId === tag.id).sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime())[0];
                        const lastReader = lastEvent ? rfidReaders.find(r => r.id === lastEvent.readerId) : null;
                        const lastZone = lastEvent ? rfidZones.find(z => z.id === lastEvent.zoneId) : null;
                        return (
                          <TableRow key={tag.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-xs font-semibold text-purple-700">{tag.tagEpc}</TableCell>
                            <TableCell className="text-xs capitalize">{tag.materialType}</TableCell>
                            <TableCell className="font-mono text-xs text-gray-600">{tag.batchNumber ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{lastZone?.name ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{lastReader?.readerCode ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-400">{lastEvent?.rssi ?? "—"} dBm</TableCell>
                            <TableCell>{statusBadge(tag.status)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: EXCEPTIONS ──────────────────────────────────────────── */}
            <TabsContent value="exceptions" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Scan Exception Workbench</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Invalid or unresolvable scan events requiring operator action</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-red-50 text-red-700 border-red-200 border">
                    {exceptions.filter(e => e.resolvedStatus === "open").length} Open
                  </Badge>
                  <Badge className="bg-green-50 text-green-700 border-green-200 border">
                    {exceptions.filter(e => e.resolvedStatus === "resolved").length} Resolved
                  </Badge>
                </div>
              </div>

              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  {loadingEx ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading exceptions...</div>
                  ) : exceptions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No exceptions found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs">Exception #</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Scan Method</TableHead>
                          <TableHead className="text-xs">Scanned Value</TableHead>
                          <TableHead className="text-xs">Location</TableHead>
                          <TableHead className="text-xs">Material / Batch</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">Detected</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exceptions.map(ex => (
                          <TableRow key={ex.id} className={`hover:bg-gray-50 ${ex.resolvedStatus === "open" ? "bg-red-50/20" : ""}`}>
                            <TableCell className="font-mono text-xs font-bold text-gray-700">{ex.exceptionNumber}</TableCell>
                            <TableCell>{exceptionTypeBadge(ex.exceptionType)}</TableCell>
                            <TableCell>
                              <Badge className={`border-0 text-xs ${ex.scanType === "rfid" ? "bg-purple-50 text-purple-700" : ex.scanType === "barcode" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}>
                                {ex.scanType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-600 max-w-[140px] truncate">{ex.scannedValue ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{ex.locationName ?? ex.locationCode ?? "—"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{ex.materialCode ?? "—"}{ex.batchNumber ? ` / ${ex.batchNumber}` : ""}</TableCell>
                            <TableCell className="text-xs text-gray-600 max-w-[200px]">{ex.description}</TableCell>
                            <TableCell className="text-xs text-gray-400">{fmt(ex.scannedAt)}</TableCell>
                            <TableCell>{statusBadge(ex.resolvedStatus)}</TableCell>
                            <TableCell>
                              {ex.resolvedStatus === "open" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs"
                                  onClick={() => { setSelectedEx(ex); setResolveOpen(true); }}>
                                  Resolve
                                </Button>
                              )}
                              {ex.resolvedStatus === "resolved" && (
                                <span className="text-xs text-gray-400">by {ex.resolvedBy}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB: LEDGER ──────────────────────────────────────────────── */}
            <TabsContent value="ledger" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Inventory Movement Ledger</h3>
                <p className="text-xs text-gray-500 mt-0.5">Full audit trail of all inventory movements across all handling units</p>
              </div>
              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">HU Code</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Material</TableHead>
                        <TableHead className="text-xs">Batch</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Location</TableHead>
                        <TableHead className="text-xs">Supplier</TableHead>
                        <TableHead className="text-xs">Received</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Barcode</TableHead>
                        <TableHead className="text-xs">RFID EPC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {handlingUnits.map(hu => (
                        <TableRow key={hu.id} className="hover:bg-gray-50 text-xs">
                          <TableCell className="font-mono font-bold text-blue-700">{hu.huCode}</TableCell>
                          <TableCell className="capitalize">{hu.huType}</TableCell>
                          <TableCell>{hu.materialName ?? hu.materialCode ?? "—"}</TableCell>
                          <TableCell className="font-mono text-gray-600">{hu.batchNumber ?? "—"}</TableCell>
                          <TableCell className="font-semibold">{hu.quantity} {hu.uom}</TableCell>
                          <TableCell className="text-gray-500">{hu.currentLocationName ?? hu.currentLocationCode ?? "—"}</TableCell>
                          <TableCell className="text-gray-500">{hu.supplierName ?? "—"}</TableCell>
                          <TableCell className="text-gray-500">{fmt(hu.receivedDate)}</TableCell>
                          <TableCell>{statusBadge(hu.status)}</TableCell>
                          <TableCell className="font-mono text-green-700">{hu.barcodeValue ?? "—"}</TableCell>
                          <TableCell className="font-mono text-purple-600 max-w-[100px] truncate">{hu.rfidEpc ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── MOVEMENT DIALOG ──────────────────────────────────────────────────── */}
      <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementTypes.find(m => m.key === selectedMovType) && (() => {
                const mt = movementTypes.find(m => m.key === selectedMovType)!;
                return <><mt.icon className={`h-5 w-5 ${mt.iconColor}`} /> {mt.label}</>;
              })()}
            </DialogTitle>
          </DialogHeader>
          <Form {...movementForm}>
            <form onSubmit={movementForm.handleSubmit(d => movementMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={movementForm.control} name="movementType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Movement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {movementTypes.map(m => <SelectItem key={m.key} value={m.key} className="text-xs">{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={movementForm.control} name="huCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">HU Code / Scan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select HU..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {handlingUnits.map(h => <SelectItem key={h.id} value={h.huCode} className="text-xs">{h.huCode} — {h.materialName ?? h.materialCode}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={movementForm.control} name="sourceLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Source Location</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. A-01-R01" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={movementForm.control} name="destinationLocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Destination Location</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. C-01-S01" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={movementForm.control} name="batchNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Batch / Lot</FormLabel>
                    <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={movementForm.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Quantity</FormLabel>
                    <FormControl><Input {...field} type="number" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={movementForm.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Reference (PO / Order No.)</FormLabel>
                  <FormControl><Input {...field} placeholder="PO-2024-001 or PRD-001" className="h-9 text-xs" /></FormControl>
                </FormItem>
              )} />
              <FormField control={movementForm.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setMovementOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={movementMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {movementMutation.isPending ? "Logging..." : "Log Movement"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── ADD HANDLING UNIT DIALOG ─────────────────────────────────────────── */}
      <Dialog open={huDialogOpen} onOpenChange={setHuDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Handling Unit</DialogTitle></DialogHeader>
          <Form {...huForm}>
            <form onSubmit={huForm.handleSubmit(d => createHUMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={huForm.control} name="huCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">HU Code *</FormLabel>
                    <FormControl><Input {...field} placeholder="PALT-00099" className="h-9 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="huType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["pallet", "carton", "item", "tote"].map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="materialCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Material Code</FormLabel>
                    <FormControl><Input {...field} placeholder="RM-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="materialName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Material Name</FormLabel>
                    <FormControl><Input {...field} placeholder="Paracetamol API" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="batchNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Batch Number</FormLabel>
                    <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Quantity</FormLabel>
                    <FormControl><Input {...field} type="number" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="uom" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">UOM</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["units", "kg", "g", "mg", "liters", "ml", "sheets", "rolls"].map(u => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="currentLocationCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Location Code</FormLabel>
                    <FormControl><Input {...field} placeholder="A-01-R01" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="barcodeValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Barcode Value</FormLabel>
                    <FormControl><Input {...field} placeholder="PALT-00099" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={huForm.control} name="rfidEpc" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">RFID EPC</FormLabel>
                    <FormControl><Input {...field} placeholder="E2000018921802180C..." className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={huForm.control} name="supplierName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Supplier</FormLabel>
                  <FormControl><Input {...field} placeholder="Pharma APIs Ltd" className="h-9 text-xs" /></FormControl>
                </FormItem>
              )} />
              <FormField control={huForm.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setHuDialogOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={createHUMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {createHUMutation.isPending ? "Creating..." : "Create HU"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── RESOLVE EXCEPTION DIALOG ─────────────────────────────────────────── */}
      {selectedEx && (
        <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Resolve Exception
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-800 mb-1">{selectedEx.exceptionNumber} · {exceptionTypeBadge(selectedEx.exceptionType)}</p>
                <p className="text-xs text-red-700">{selectedEx.description}</p>
                <p className="text-xs text-red-500 mt-1">Scanned: {selectedEx.scannedValue ?? "—"} · Location: {selectedEx.locationName ?? "—"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Resolved by</label>
                <Input id="resolvedBy" placeholder="Your name" className="h-9 text-xs" />
                <label className="text-xs font-medium text-gray-700">Resolution notes</label>
                <Textarea id="resolveNotes" placeholder="Describe how this exception was resolved..." rows={3} className="text-xs resize-none" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setResolveOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={resolveMutation.isPending}
                onClick={() => {
                  const by = (document.getElementById("resolvedBy") as HTMLInputElement)?.value;
                  const notes = (document.getElementById("resolveNotes") as HTMLTextAreaElement)?.value;
                  if (!by) return;
                  resolveMutation.mutate({ id: selectedEx.id, resolvedBy: by, notes });
                }}>
                {resolveMutation.isPending ? "Resolving..." : "Mark Resolved"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
