import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ScanException, HandlingUnit } from "@shared/schema";
import { AlertTriangle, CheckCircle2, Clock, Search, XCircle, MapPin, Tag, RotateCcw, ShieldAlert, Package2 } from "lucide-react";

const EXCEPTION_META: Record<string, {
  label: string; icon: string; color: string; textColor: string;
  resolution: string; fields: Array<{ key: string; label: string; type?: string; options?: string[] }>;
}> = {
  unknown_tag: {
    label: "Unknown Tag", icon: "❓", color: "bg-gray-100", textColor: "text-gray-700",
    resolution: "Map this tag to a known HU or material",
    fields: [
      { key: "mappedHU", label: "Map to Handling Unit", type: "select-hu" },
      { key: "mappedMaterial", label: "Material Code", type: "text" },
    ],
  },
  wrong_location: {
    label: "Wrong Location", icon: "📍", color: "bg-blue-100", textColor: "text-blue-800",
    resolution: "Physically move stock to the correct location",
    fields: [
      { key: "correctLocation", label: "Correct Location Code", type: "text" },
      { key: "movedBy", label: "Moved by Operator", type: "text" },
    ],
  },
  wrong_batch: {
    label: "Wrong Batch", icon: "⚠️", color: "bg-yellow-100", textColor: "text-yellow-800",
    resolution: "Verify and correct the batch / lot assignment",
    fields: [
      { key: "correctBatch", label: "Correct Batch Number", type: "text" },
      { key: "action", label: "Action Taken", type: "select", options: ["Re-labelled with correct batch", "Returned to supplier", "Placed in quarantine", "Destroyed / Scrapped", "Approved exception"] },
    ],
  },
  duplicate_scan: {
    label: "Duplicate Scan", icon: "🔄", color: "bg-orange-100", textColor: "text-orange-700",
    resolution: "Confirm the duplicate is benign or correct the source",
    fields: [
      { key: "action", label: "Resolution Action", type: "select", options: ["Confirmed — duplicate is safe to ignore", "Found cause — scanner error", "Found cause — RFID multi-read", "Removed duplicate from system", "Escalated to IT"] },
    ],
  },
  no_shipment: {
    label: "No Shipment", icon: "📦", color: "bg-purple-100", textColor: "text-purple-700",
    resolution: "Link the scan to an existing or new shipment document",
    fields: [
      { key: "shipmentRef", label: "Shipment / SO Reference", type: "text" },
      { key: "action", label: "Action Taken", type: "select", options: ["Linked to existing shipment", "Created new shipment", "Returned to stock", "Awaiting dispatch instruction"] },
    ],
  },
  hold_violation: {
    label: "Hold Violation", icon: "🚫", color: "bg-red-100", textColor: "text-red-700",
    resolution: "Investigate the hold breach and take corrective action",
    fields: [
      { key: "action", label: "Resolution Action", type: "select", options: ["Hold re-confirmed — stock put back", "QC reviewed and hold lifted", "CAPA raised", "Product destroyed", "Regulatory notified"] },
      { key: "capaRef", label: "CAPA / QC Reference", type: "text" },
    ],
  },
  inactive_tag: {
    label: "Inactive Tag", icon: "📵", color: "bg-gray-100", textColor: "text-gray-500",
    resolution: "Decommission or reassign the inactive tag",
    fields: [
      { key: "action", label: "Resolution Action", type: "select", options: ["Tag decommissioned", "Tag reassigned to new HU", "Scrap tag — issue new one", "Tag was re-activated in error"] },
    ],
  },
  quantity_mismatch: {
    label: "Quantity Mismatch", icon: "⚖️", color: "bg-pink-100", textColor: "text-pink-700",
    resolution: "Recount or adjust stock to reconcile the variance",
    fields: [
      { key: "physicalCount", label: "Physical Count (actual qty)", type: "text" },
      { key: "action", label: "Adjustment Action", type: "select", options: ["Stock adjusted to physical count", "Recount confirmed — system is correct", "Variance within tolerance — approved", "Shrinkage posted", "Escalated to warehouse manager"] },
    ],
  },
};

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function InventoryExceptions() {
  const { toast } = useToast();
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState<ScanException | null>(null);
  const [resolvedBy, setResolvedBy] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");

  const { data: exceptions = [], isLoading } = useQuery<ScanException[]>({ queryKey: ["/api/traceability/exceptions"] });
  const { data: handlingUnits = [] } = useQuery<HandlingUnit[]>({ queryKey: ["/api/traceability/handling-units"] });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolvedBy, notes }: { id: string; resolvedBy: string; notes: string }) =>
      apiRequest("PUT", `/api/traceability/exceptions/${id}/resolve`, { resolvedBy, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/exceptions"] });
      toast({ title: "Exception resolved" });
      setResolveOpen(false);
      setSelectedEx(null);
      setResolvedBy("");
      setResolveNotes("");
      setFieldValues({});
    },
    onError: () => toast({ title: "Failed to resolve", variant: "destructive" }),
  });

  const ignoreMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/traceability/exceptions/${id}/resolve`, { resolvedBy: "Auto-ignored", notes: "Operator marked as ignorable — no action needed" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/traceability/exceptions"] }); toast({ title: "Exception ignored" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  function buildResolutionNote() {
    const meta = selectedEx ? EXCEPTION_META[selectedEx.exceptionType] : null;
    if (!meta) return resolveNotes;
    const parts: string[] = [];
    for (const f of meta.fields) {
      const val = fieldValues[f.key];
      if (val) parts.push(`${f.label}: ${val}`);
    }
    if (resolveNotes) parts.push(`Notes: ${resolveNotes}`);
    return parts.join(" | ");
  }

  function submitResolve() {
    if (!selectedEx || !resolvedBy) return;
    resolveMutation.mutate({ id: selectedEx.id, resolvedBy, notes: buildResolutionNote() });
  }

  const stats = {
    total: exceptions.length,
    open: exceptions.filter(e => e.resolvedStatus === "open").length,
    resolved: exceptions.filter(e => e.resolvedStatus === "resolved").length,
    ignored: exceptions.filter(e => e.resolvedStatus === "ignored").length,
  };

  const byType = Object.entries(EXCEPTION_META).map(([k, v]) => ({
    type: k, label: v.label, icon: v.icon,
    open: exceptions.filter(e => e.exceptionType === k && e.resolvedStatus === "open").length,
    total: exceptions.filter(e => e.exceptionType === k).length,
  })).filter(t => t.total > 0);

  const filtered = exceptions.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.exceptionNumber.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) || (e.scannedValue ?? "").toLowerCase().includes(q) ||
      (e.locationName ?? "").toLowerCase().includes(q) || (e.materialCode ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || e.exceptionType === typeFilter;
    const matchStatus = statusFilter === "all" || e.resolvedStatus === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const exMeta = selectedEx ? EXCEPTION_META[selectedEx.exceptionType] : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scan Exception Workbench</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review, investigate and resolve scan anomalies with exception-specific resolution workflows</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Open", value: stats.open, icon: Clock, color: "text-red-600", bg: "bg-red-50 border-red-200" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
              { label: "Ignored", value: stats.ignored, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
              { label: "Total", value: stats.total, icon: AlertTriangle, color: "text-gray-700", bg: "bg-white border-gray-200" },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                  <div><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Exception type breakdown */}
          {byType.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {byType.map(t => {
                const meta = EXCEPTION_META[t.type];
                return (
                  <button key={t.type} onClick={() => { setTypeFilter(t.type); setStatusFilter("open"); }}
                    className={`${meta.color} border rounded-xl p-3 text-left hover:shadow-sm transition-all ${typeFilter === t.type ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{meta.icon}</span>
                      {t.open > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{t.open}</span>}
                    </div>
                    <p className={`font-semibold text-xs ${meta.textColor}`}>{meta.label}</p>
                    <p className="text-xs text-gray-400">{t.total} total</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exception, location, barcode..." className="pl-8 h-8 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {Object.entries(EXCEPTION_META).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.icon} {v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                {["open", "resolved", "ignored"].map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-gray-400">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No exceptions found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Scan Method</TableHead>
                      <TableHead className="text-xs">Scanned Value</TableHead>
                      <TableHead className="text-xs">Location</TableHead>
                      <TableHead className="text-xs">Material / Batch</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Detected</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Resolution</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(ex => {
                      const meta = EXCEPTION_META[ex.exceptionType];
                      return (
                        <TableRow key={ex.id} className={`hover:bg-gray-50 ${ex.resolvedStatus === "open" ? "bg-red-50/20" : ""}`}>
                          <TableCell className="font-mono text-xs font-bold text-gray-600">{ex.exceptionNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span>{meta?.icon}</span>
                              <Badge className={`${meta?.color ?? "bg-gray-100"} ${meta?.textColor ?? "text-gray-700"} border-0 text-xs`}>
                                {meta?.label ?? ex.exceptionType}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border-0 text-xs ${ex.scanType === "rfid" ? "bg-purple-50 text-purple-700" : ex.scanType === "barcode" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}>
                              {ex.scanType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-600 max-w-[130px] truncate">{ex.scannedValue ?? "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">{ex.locationName ?? ex.locationCode ?? "—"}</TableCell>
                          <TableCell className="text-xs">
                            <div><p className="font-medium text-gray-700">{ex.materialCode ?? "—"}</p><p className="text-gray-400 font-mono">{ex.batchNumber ?? ""}</p></div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 max-w-[200px]">{ex.description}</TableCell>
                          <TableCell className="text-xs text-gray-400">{fmt(ex.scannedAt)}</TableCell>
                          <TableCell>
                            <Badge className={`border-0 text-xs ${ex.resolvedStatus === "open" ? "bg-red-100 text-red-700" : ex.resolvedStatus === "resolved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                              {ex.resolvedStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-400 max-w-[120px] truncate">
                            {ex.resolvedBy ? <span className="font-medium text-gray-600">by {ex.resolvedBy}</span> : "—"}
                            {ex.notes && <p className="text-gray-300 truncate">{ex.notes}</p>}
                          </TableCell>
                          <TableCell>
                            {ex.resolvedStatus === "open" && (
                              <div className="flex gap-1">
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                                  onClick={() => { setSelectedEx(ex); setFieldValues({}); setResolvedBy(""); setResolveNotes(""); setResolveOpen(true); }}>
                                  Resolve
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-gray-400" onClick={() => ignoreMutation.mutate(ex.id)}>
                                  Ignore
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolution Dialog */}
      {selectedEx && exMeta && (
        <Dialog open={resolveOpen} onOpenChange={v => { setResolveOpen(v); if (!v) { setSelectedEx(null); setFieldValues({}); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{exMeta.icon}</span>
                <div>
                  <DialogTitle>Resolve: {exMeta.label}</DialogTitle>
                  <p className="text-xs text-gray-500 mt-0.5">{exMeta.resolution}</p>
                </div>
              </div>
            </DialogHeader>

            {/* Exception context card */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
              <div className="grid grid-cols-2 gap-1.5 text-red-700">
                <div><span className="text-red-400">Exception #:</span> <span className="font-mono font-bold">{selectedEx.exceptionNumber}</span></div>
                <div><span className="text-red-400">Scan type:</span> {selectedEx.scanType}</div>
                <div><span className="text-red-400">Scanned value:</span> <span className="font-mono">{selectedEx.scannedValue ?? "—"}</span></div>
                <div><span className="text-red-400">Location:</span> {selectedEx.locationName ?? "—"}</div>
                <div className="col-span-2"><span className="text-red-400">Description:</span> {selectedEx.description}</div>
              </div>
            </div>

            {/* Exception-specific resolution fields */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Resolution Actions</p>
              {exMeta.fields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">{f.label}</label>
                  {f.type === "select" ? (
                    <Select value={fieldValues[f.key] ?? ""} onValueChange={v => setFieldValues(prev => ({ ...prev, [f.key]: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {f.options!.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : f.type === "select-hu" ? (
                    <Select value={fieldValues[f.key] ?? ""} onValueChange={v => setFieldValues(prev => ({ ...prev, [f.key]: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Handling Unit..." /></SelectTrigger>
                      <SelectContent>
                        {handlingUnits.map(h => <SelectItem key={h.id} value={h.huCode} className="text-xs font-mono">{h.huCode} — {h.materialName ?? h.materialCode}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={fieldValues[f.key] ?? ""} onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={`Enter ${f.label.toLowerCase()}...`} className="h-9 text-xs" />
                  )}
                </div>
              ))}
            </div>

            {/* Operator and notes */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Resolved By (Operator / Manager) *</label>
                <Input value={resolvedBy} onChange={e => setResolvedBy(e.target.value)} placeholder="Operator name / ID" className="h-9 text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Additional Notes</label>
                <Textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} rows={2}
                  className="text-xs resize-none" placeholder="Any additional investigation details or comments..." />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setResolveOpen(false)}>Cancel</Button>
              <Button size="sm" disabled={!resolvedBy || resolveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={submitResolve}>
                {resolveMutation.isPending ? "Resolving..." : "Mark Resolved"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
