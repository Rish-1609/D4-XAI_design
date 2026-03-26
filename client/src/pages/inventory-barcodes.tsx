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
import type { Barcode, HandlingUnit } from "@shared/schema";
import { QrCode, Plus, Search, Printer, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const barcodeSchema = z.object({
  barcodeValue: z.string().min(1, "Barcode value is required"),
  barcodeType: z.string().min(1, "Select barcode type"),
  linkedHuCode: z.string().optional(),
  materialCode: z.string().optional(),
  batchNumber: z.string().optional(),
  labelType: z.string().optional(),
  printedBy: z.string().optional(),
  notes: z.string().optional(),
});
type BarcodeForm = z.infer<typeof barcodeSchema>;

export default function InventoryBarcodes() {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: barcodes = [], isLoading } = useQuery<Barcode[]>({
    queryKey: ["/api/traceability/barcodes"],
  });
  const { data: handlingUnits = [] } = useQuery<HandlingUnit[]>({
    queryKey: ["/api/traceability/handling-units"],
  });

  const form = useForm<BarcodeForm>({
    resolver: zodResolver(barcodeSchema),
    defaultValues: { barcodeType: "HU", labelType: "pallet", printedBy: "" },
  });

  const watchedHU = form.watch("linkedHuCode");
  const linkedHUObj = handlingUnits.find(h => h.huCode === watchedHU);

  const createMutation = useMutation({
    mutationFn: (data: BarcodeForm) => {
      const hu = handlingUnits.find(h => h.huCode === data.linkedHuCode);
      return apiRequest("POST", "/api/traceability/barcodes", {
        ...data,
        linkedHuId: hu?.id,
        status: "active",
        printedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/barcodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Barcode registered successfully" });
      setAddOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to register barcode", variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PUT", `/api/traceability/barcodes/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/barcodes"] });
      toast({ title: "Barcode status updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const filtered = barcodes.filter(b => {
    const matchSearch = !search ||
      b.barcodeValue.toLowerCase().includes(search.toLowerCase()) ||
      (b.materialCode ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.batchNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.linkedHuCode ?? "").toLowerCase().includes(search.toLowerCase());
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

  function fmt(d?: Date | string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barcode Registry</h1>
              <p className="text-sm text-gray-500 mt-0.5">Generate, register and manage barcode labels across all handling units</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { form.reset({ barcodeType: "HU", labelType: "pallet" }); setAddOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Register Barcode
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Barcodes", value: stats.total, icon: QrCode, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              { label: "Inactive", value: stats.inactive, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "Reprinted", value: stats.reprinted, icon: Printer, color: "text-amber-600", bg: "bg-amber-50" },
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

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search barcode / material / batch / HU..." className="pl-8 h-8 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {["HU", "material", "location", "batch"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
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
                      <TableHead className="text-xs font-semibold">Barcode Value</TableHead>
                      <TableHead className="text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-xs font-semibold">Label</TableHead>
                      <TableHead className="text-xs font-semibold">Linked HU</TableHead>
                      <TableHead className="text-xs font-semibold">Material Code</TableHead>
                      <TableHead className="text-xs font-semibold">Batch / Lot</TableHead>
                      <TableHead className="text-xs font-semibold">Printed By</TableHead>
                      <TableHead className="text-xs font-semibold">Printed At</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Actions</TableHead>
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
                        <TableCell className="text-xs capitalize text-gray-600">{bc.labelType ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-700">{bc.linkedHuCode ?? "—"}</TableCell>
                        <TableCell className="text-xs font-medium">{bc.materialCode ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">{bc.batchNumber ?? "—"}</TableCell>
                        <TableCell className="text-xs text-gray-500">{bc.printedBy ?? "—"}</TableCell>
                        <TableCell className="text-xs text-gray-400">{fmt(bc.printedAt)}</TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${bc.status === "active" ? "bg-green-100 text-green-800" : bc.status === "reprinted" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                            {bc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {bc.status === "active" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2" title="Deactivate"
                                onClick={() => deactivateMutation.mutate({ id: bc.id, status: "inactive" })}>
                                <XCircle className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            )}
                            {bc.status === "inactive" && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2" title="Reactivate"
                                onClick={() => deactivateMutation.mutate({ id: bc.id, status: "active" })}>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" title="Mark as reprinted"
                              onClick={() => deactivateMutation.mutate({ id: bc.id, status: "reprinted" })}>
                              <Printer className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
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

      {/* Register Barcode Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) form.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-green-600" /> Register New Barcode
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="barcodeValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Barcode Value *</FormLabel>
                    <FormControl><Input {...field} placeholder="PALT-00001" className="h-9 text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="barcodeType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["HU", "material", "location", "batch"].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkedHuCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Link to Handling Unit</FormLabel>
                    <Select onValueChange={v => {
                      field.onChange(v);
                      const hu = handlingUnits.find(h => h.huCode === v);
                      if (hu) {
                        form.setValue("materialCode", hu.materialCode ?? "");
                        form.setValue("batchNumber", hu.batchNumber ?? "");
                        form.setValue("barcodeValue", hu.barcodeValue ?? hu.huCode);
                      }
                    }} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select HU (optional)" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {handlingUnits.map(h => <SelectItem key={h.id} value={h.huCode} className="text-xs">{h.huCode} — {h.materialName ?? h.materialCode}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="labelType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Label Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["pallet", "carton", "item", "location"].map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="materialCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Material Code</FormLabel>
                    <FormControl><Input {...field} placeholder="RM-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="batchNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Batch / Lot</FormLabel>
                    <FormControl><Input {...field} placeholder="BT-2024-001" className="h-9 text-xs" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="printedBy" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Printed / Created by</FormLabel>
                  <FormControl><Input {...field} placeholder="Operator / Team name" className="h-9 text-xs" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notes</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="text-xs resize-none" /></FormControl>
                </FormItem>
              )} />
              {linkedHUObj && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <p className="font-semibold mb-1">Auto-linked HU: {linkedHUObj.huCode}</p>
                  <p>Material: {linkedHUObj.materialName} | Batch: {linkedHUObj.batchNumber ?? "—"} | Location: {linkedHUObj.currentLocationName ?? "—"}</p>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {createMutation.isPending ? "Registering..." : "Register Barcode"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
