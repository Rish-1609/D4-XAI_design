import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Barcode, HandlingUnit } from "@shared/schema";
import { QrCode, Plus, Search, Printer, CheckCircle2, XCircle, RefreshCw, Tag, Layers } from "lucide-react";

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const registerSchema = z.object({
  barcodeValue: z.string().min(1, "Barcode value is required"),
  barcodeType: z.string().min(1),
  linkedHuCode: z.string().optional(),
  materialCode: z.string().optional(),
  batchNumber: z.string().optional(),
  labelType: z.string().optional(),
  printedBy: z.string().optional(),
  notes: z.string().optional(),
});

const printSchema = z.object({
  printedBy: z.string().min(1, "Enter operator name"),
  printerName: z.string().min(1, "Select a printer"),
  labelTemplate: z.string().min(1, "Select label template"),
  copies: z.string().default("1"),
  reason: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;
type PrintForm = z.infer<typeof printSchema>;

const PRINTERS = ["Zebra ZT411 (Rack A)", "Zebra ZD421 (Dispatch Bay)", "Zebra ZT230 (FG Store)", "Zebra ZT610 (Receiving Dock)", "Zebra ZD230 (Lab)"];
const LABEL_TEMPLATES = [
  { key: "pallet-gs1", label: "Pallet Label — GS1-128" },
  { key: "carton-gs1", label: "Carton Label — GS1-128" },
  { key: "item-gs1", label: "Item Label — GS1-128" },
  { key: "location-barcode", label: "Location Label — Code128" },
  { key: "batch-label", label: "Batch / Lot Label — QR" },
  { key: "pallet-rfid", label: "Pallet + RFID Label — EPC" },
];

export default function InventoryBarcodes() {
  const { toast } = useToast();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState<Barcode | null>(null);
  const [isReprint, setIsReprint] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: barcodes = [], isLoading } = useQuery<Barcode[]>({ queryKey: ["/api/traceability/barcodes"] });
  const { data: handlingUnits = [] } = useQuery<HandlingUnit[]>({ queryKey: ["/api/traceability/handling-units"] });

  const regForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { barcodeType: "HU", labelType: "pallet" },
  });

  const printForm = useForm<PrintForm>({
    resolver: zodResolver(printSchema),
    defaultValues: { copies: "1" },
  });

  const watchedHU = regForm.watch("linkedHuCode");
  const linkedHUObj = handlingUnits.find(h => h.huCode === watchedHU);

  function autoGenerateValue() {
    const prefix = regForm.getValues("barcodeType") === "HU" ? "HU" : regForm.getValues("barcodeType") === "location" ? "LOC" : "BC";
    const val = `${prefix}-${Date.now().toString().slice(-8)}`;
    regForm.setValue("barcodeValue", val);
  }

  const createMutation = useMutation({
    mutationFn: (data: RegisterForm) => {
      const hu = handlingUnits.find(h => h.huCode === data.linkedHuCode);
      return apiRequest("POST", "/api/traceability/barcodes", {
        ...data, linkedHuId: hu?.id, status: "active", printedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/barcodes"] });
      toast({ title: "Barcode registered" });
      setRegisterOpen(false);
      regForm.reset();
    },
    onError: () => toast({ title: "Failed to register", variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PUT", `/api/traceability/barcodes/${id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/traceability/barcodes"] }); toast({ title: "Status updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const printMutation = useMutation({
    mutationFn: ({ bc, pf, reprint }: { bc: Barcode; pf: PrintForm; reprint: boolean }) =>
      apiRequest("PUT", `/api/traceability/barcodes/${bc.id}`, {
        printedBy: pf.printedBy,
        printedAt: new Date().toISOString(),
        status: reprint ? "reprinted" : bc.status,
        notes: `${reprint ? "Reprint" : "Print"} — ${pf.labelTemplate} — ${pf.printerName} — Copies: ${pf.copies}${pf.reason ? " — " + pf.reason : ""}`,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/barcodes"] });
      toast({ title: `Label ${vars.reprint ? "reprinted" : "printed"} on ${printForm.getValues("printerName")}` });
      setPrintOpen(false);
      setPrintTarget(null);
      printForm.reset();
    },
    onError: () => toast({ title: "Print failed", variant: "destructive" }),
  });

  function openPrint(bc: Barcode, reprint = false) {
    setPrintTarget(bc);
    setIsReprint(reprint);
    printForm.reset({ copies: "1", labelTemplate: bc.labelType ?? "pallet-gs1" });
    setPrintOpen(true);
  }

  const filtered = barcodes.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search || b.barcodeValue.toLowerCase().includes(q) ||
      (b.materialCode ?? "").toLowerCase().includes(q) || (b.batchNumber ?? "").toLowerCase().includes(q) ||
      (b.linkedHuCode ?? "").toLowerCase().includes(q) || (b.printedBy ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || b.barcodeType === typeFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: barcodes.length,
    active: barcodes.filter(b => b.status === "active").length,
    inactive: barcodes.filter(b => b.status === "inactive").length,
    reprinted: barcodes.filter(b => b.status === "reprinted").length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barcode Registry</h1>
              <p className="text-sm text-gray-500 mt-0.5">Generate, print, reprint and manage barcode labels for all handling units</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { regForm.reset({ barcodeType: "HU", labelType: "pallet" }); setRegisterOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Generate Barcode
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Labels", value: stats.total, icon: QrCode, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              { label: "Inactive / Void", value: stats.inactive, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "Reprinted", value: stats.reprinted, icon: Printer, color: "text-amber-600", bg: "bg-amber-50" },
            ].map(s => (
              <Card key={s.label} className="border border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`${s.bg} rounded-lg p-2`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                  <div><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Label flow guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-6 items-center overflow-x-auto">
            {[
              { step: "1", label: "Generate", icon: QrCode, desc: "Create barcode + assign to HU" },
              { step: "2", label: "Print", icon: Printer, desc: "Select template + printer, print label" },
              { step: "3", label: "Attach", icon: Tag, desc: "Attach label to physical HU" },
              { step: "4", label: "Scan / Verify", icon: Layers, desc: "Scan to verify at any point" },
              { step: "5", label: "Reprint (if lost)", icon: RefreshCw, desc: "Reprint with reason code" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold mx-auto mb-1">{s.step}</div>
                  <s.icon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-blue-900">{s.label}</p>
                  <p className="text-xs text-blue-500 max-w-[80px]">{s.desc}</p>
                </div>
                {i < 4 && <div className="text-blue-300 text-lg">→</div>}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search barcode, material, batch, HU..." className="pl-8 h-8 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {["HU", "material", "location", "batch"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                {["active", "inactive", "reprinted"].map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-gray-400 text-sm">Loading barcodes...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">No barcodes found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Barcode</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Label Template</TableHead>
                      <TableHead className="text-xs">Linked HU</TableHead>
                      <TableHead className="text-xs">Material</TableHead>
                      <TableHead className="text-xs">Batch</TableHead>
                      <TableHead className="text-xs">Printed By</TableHead>
                      <TableHead className="text-xs">Printed At</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(bc => (
                      <TableRow key={bc.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="font-mono text-xs font-bold text-green-700">{bc.barcodeValue}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${bc.barcodeType === "HU" ? "bg-blue-50 text-blue-700" : bc.barcodeType === "location" ? "bg-indigo-50 text-indigo-700" : bc.barcodeType === "batch" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700"}`}>
                            {bc.barcodeType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{bc.labelType ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-700 font-semibold">{bc.linkedHuCode ?? "—"}</TableCell>
                        <TableCell className="text-xs">{bc.materialCode ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">{bc.batchNumber ?? "—"}</TableCell>
                        <TableCell className="text-xs text-gray-500">{bc.printedBy ?? "—"}</TableCell>
                        <TableCell className="text-xs text-gray-400">{fmt(bc.printedAt)}</TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${bc.status === "active" ? "bg-green-100 text-green-800" : bc.status === "reprinted" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                            {bc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-green-600 hover:bg-green-50" title="Print label" onClick={() => openPrint(bc, false)}>
                              <Printer className="h-3.5 w-3.5 mr-1" /> Print
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-amber-600 hover:bg-amber-50" title="Reprint label" onClick={() => openPrint(bc, true)}>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reprint
                            </Button>
                            {bc.status === "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-red-400 hover:bg-red-50" title="Deactivate"
                                onClick={() => statusMutation.mutate({ id: bc.id, status: "inactive" })}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {bc.status === "inactive" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-green-500 hover:bg-green-50" title="Reactivate"
                                onClick={() => statusMutation.mutate({ id: bc.id, status: "active" })}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Register/Generate Dialog */}
      <Dialog open={registerOpen} onOpenChange={v => { setRegisterOpen(v); if (!v) regForm.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-green-600" /> Generate Barcode</DialogTitle>
          </DialogHeader>
          <Form {...regForm}>
            <form onSubmit={regForm.handleSubmit(d => createMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={regForm.control} name="barcodeType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Barcode Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["HU", "material", "location", "batch"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={regForm.control} name="labelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Label Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LABEL_TEMPLATES.map(t => <SelectItem key={t.key} value={t.key} className="text-xs">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={regForm.control} name="barcodeValue" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Barcode Value *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl><Input {...field} placeholder="Enter or auto-generate" className="h-9 text-xs font-mono flex-1" /></FormControl>
                    <Button type="button" size="sm" variant="outline" className="h-9 text-xs" onClick={autoGenerateValue}>Auto</Button>
                  </div>
                </FormItem>
              )} />

              <FormField control={regForm.control} name="linkedHuCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Link to Handling Unit</FormLabel>
                  <Select onValueChange={v => {
                    field.onChange(v);
                    const hu = handlingUnits.find(h => h.huCode === v);
                    if (hu) {
                      regForm.setValue("materialCode", hu.materialCode ?? "");
                      regForm.setValue("batchNumber", hu.batchNumber ?? "");
                      if (!regForm.getValues("barcodeValue")) regForm.setValue("barcodeValue", hu.barcodeValue ?? hu.huCode);
                    }
                  }} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select HU (optional)" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {handlingUnits.map(h => <SelectItem key={h.id} value={h.huCode} className="text-xs font-mono">{h.huCode} — {h.materialName ?? h.materialCode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              {linkedHUObj && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                  <p className="font-semibold mb-1">Linked HU: {linkedHUObj.huCode}</p>
                  <p>Material: {linkedHUObj.materialName} | Batch: {linkedHUObj.batchNumber ?? "—"} | Location: {linkedHUObj.currentLocationName ?? "—"}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField control={regForm.control} name="materialCode" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Material Code</FormLabel><FormControl><Input {...field} placeholder="RM-001" className="h-9 text-xs" /></FormControl></FormItem>
                )} />
                <FormField control={regForm.control} name="batchNumber" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Batch</FormLabel><FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={regForm.control} name="printedBy" render={({ field }) => (
                <FormItem><FormLabel className="text-xs">Generated / Requested By</FormLabel><FormControl><Input {...field} placeholder="Operator / Team name" className="h-9 text-xs" /></FormControl></FormItem>
              )} />
              <FormField control={regForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel className="text-xs">Notes</FormLabel><FormControl><Textarea {...field} rows={2} className="text-xs resize-none" /></FormControl></FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setRegisterOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {createMutation.isPending ? "Generating..." : "Generate Barcode"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Print / Reprint Dialog */}
      {printTarget && (
        <Dialog open={printOpen} onOpenChange={v => { setPrintOpen(v); if (!v) { setPrintTarget(null); printForm.reset(); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className={`h-5 w-5 ${isReprint ? "text-amber-600" : "text-green-600"}`} />
                {isReprint ? "Reprint Label" : "Print Label"} — <span className="font-mono text-sm">{printTarget.barcodeValue}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="bg-gray-50 border rounded-lg p-3 text-xs mb-3">
              <div className="grid grid-cols-2 gap-1">
                <div><span className="text-gray-400">Barcode:</span> <span className="font-mono font-bold">{printTarget.barcodeValue}</span></div>
                <div><span className="text-gray-400">Type:</span> {printTarget.barcodeType}</div>
                <div><span className="text-gray-400">HU:</span> {printTarget.linkedHuCode ?? "—"}</div>
                <div><span className="text-gray-400">Material:</span> {printTarget.materialCode ?? "—"}</div>
                <div><span className="text-gray-400">Batch:</span> {printTarget.batchNumber ?? "—"}</div>
                <div><span className="text-gray-400">Last print:</span> {fmt(printTarget.printedAt)}</div>
              </div>
            </div>

            <Form {...printForm}>
              <form onSubmit={printForm.handleSubmit(pf => printMutation.mutate({ bc: printTarget, pf, reprint: isReprint }))} className="space-y-3">
                <FormField control={printForm.control} name="labelTemplate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Label Template *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select template" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LABEL_TEMPLATES.map(t => <SelectItem key={t.key} value={t.key} className="text-xs">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={printForm.control} name="printerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Printer *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select printer" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PRINTERS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={printForm.control} name="copies" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">No. of Copies</FormLabel>
                      <FormControl><Input {...field} type="number" min="1" max="99" className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={printForm.control} name="printedBy" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Operator *</FormLabel>
                      <FormControl><Input {...field} placeholder="Name / ID" className="h-9 text-xs" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                {isReprint && (
                  <FormField control={printForm.control} name="reason" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Reprint Reason *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select reason" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["Label damaged / torn", "Label lost", "Barcode not scanning", "Wrong printer used", "Quality issue on print", "Additional copies needed"].map(r => (
                            <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                )}
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setPrintOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={printMutation.isPending}
                    className={isReprint ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
                    {printMutation.isPending ? "Sending to printer..." : isReprint ? "Reprint Label" : "Print Label"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
