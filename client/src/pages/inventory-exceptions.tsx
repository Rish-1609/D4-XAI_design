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
import type { ScanException } from "@shared/schema";
import { AlertTriangle, CheckCircle2, Clock, Search, Filter, Eye, XCircle } from "lucide-react";

const EXCEPTION_LABELS: Record<string, string> = {
  unknown_tag: "Unknown Tag",
  wrong_location: "Wrong Location",
  wrong_batch: "Wrong Batch",
  duplicate_scan: "Duplicate Scan",
  no_shipment: "No Shipment",
  hold_violation: "Hold Violation",
  inactive_tag: "Inactive Tag",
  quantity_mismatch: "Qty Mismatch",
};

const EXCEPTION_COLORS: Record<string, string> = {
  unknown_tag: "bg-gray-100 text-gray-700",
  wrong_location: "bg-blue-100 text-blue-800",
  wrong_batch: "bg-yellow-100 text-yellow-800",
  duplicate_scan: "bg-orange-100 text-orange-700",
  no_shipment: "bg-purple-100 text-purple-700",
  hold_violation: "bg-red-100 text-red-700",
  inactive_tag: "bg-gray-100 text-gray-500",
  quantity_mismatch: "bg-pink-100 text-pink-700",
};

const EXCEPTION_ICONS: Record<string, string> = {
  unknown_tag: "❓",
  wrong_location: "📍",
  wrong_batch: "⚠️",
  duplicate_scan: "🔄",
  no_shipment: "📦",
  hold_violation: "🚫",
  inactive_tag: "📵",
  quantity_mismatch: "⚖️",
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: exceptions = [], isLoading } = useQuery<ScanException[]>({
    queryKey: ["/api/traceability/exceptions"],
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolvedBy, notes }: { id: string; resolvedBy: string; notes: string }) =>
      apiRequest("PUT", `/api/traceability/exceptions/${id}/resolve`, { resolvedBy, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/stats"] });
      toast({ title: "Exception marked as resolved" });
      setResolveOpen(false);
      setSelectedEx(null);
      setResolvedBy("");
      setResolveNotes("");
    },
    onError: () => toast({ title: "Failed to resolve exception", variant: "destructive" }),
  });

  const ignoreMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/traceability/exceptions/${id}/resolve`, { resolvedBy: "Auto-ignored", notes: "Marked as ignored by operator" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traceability/exceptions"] });
      toast({ title: "Exception ignored" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const stats = {
    total: exceptions.length,
    open: exceptions.filter(e => e.resolvedStatus === "open").length,
    resolved: exceptions.filter(e => e.resolvedStatus === "resolved").length,
    ignored: exceptions.filter(e => e.resolvedStatus === "ignored").length,
  };

  const filtered = exceptions.filter(e => {
    const matchSearch = !search ||
      e.exceptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.scannedValue ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.locationName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.materialCode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || e.exceptionType === typeFilter;
    const matchStatus = statusFilter === "all" || e.resolvedStatus === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openItems = exceptions.filter(e => e.resolvedStatus === "open");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scan Exception Workbench</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review, investigate and resolve invalid or unrecognised scan events</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Exceptions", value: stats.total, icon: AlertTriangle, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
              { label: "Open", value: stats.open, icon: Clock, color: "text-red-600", bg: "bg-red-50 border-red-200" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
              { label: "Ignored", value: stats.ignored, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                    <div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Urgent banner */}
          {stats.open > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">{stats.open} exception{stats.open > 1 ? "s" : ""} require operator attention</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {openItems.slice(0, 3).map(e => (
                      <button key={e.id} onClick={() => { setSelectedEx(e); setResolveOpen(true); }}
                        className="text-xs bg-white border border-red-200 text-red-700 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">
                        {EXCEPTION_ICONS[e.exceptionType]} {e.exceptionNumber} — {EXCEPTION_LABELS[e.exceptionType] ?? e.exceptionType}
                      </button>
                    ))}
                    {openItems.length > 3 && (
                      <span className="text-xs text-red-500 self-center">+{openItems.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search exception, location, barcode..." className="pl-8 h-8 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue placeholder="All exception types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {Object.entries(EXCEPTION_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
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
                <div className="p-10 text-center text-gray-400">Loading exceptions...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  <CheckCircle2 className="h-10 w-10 text-green-300 mx-auto mb-2" />
                  No exceptions found — all clear!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Exception Type</TableHead>
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
                    {filtered.map(ex => (
                      <TableRow key={ex.id} className={`hover:bg-gray-50 ${ex.resolvedStatus === "open" ? "bg-red-50/30" : ""}`}>
                        <TableCell className="font-mono text-xs font-bold text-gray-600">{ex.exceptionNumber}</TableCell>
                        <TableCell>
                          <Badge className={`${EXCEPTION_COLORS[ex.exceptionType] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>
                            {EXCEPTION_LABELS[ex.exceptionType] ?? ex.exceptionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${ex.scanType === "rfid" ? "bg-purple-50 text-purple-700" : ex.scanType === "barcode" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}>
                            {ex.scanType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600 max-w-[140px] truncate" title={ex.scannedValue ?? ""}>
                          {ex.scannedValue ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{ex.locationName ?? ex.locationCode ?? "—"}</TableCell>
                        <TableCell className="text-xs">
                          <div>
                            <p className="font-medium text-gray-700">{ex.materialCode ?? "—"}</p>
                            <p className="text-gray-400 font-mono">{ex.batchNumber ?? ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[220px] leading-snug">{ex.description}</TableCell>
                        <TableCell className="text-xs text-gray-400">{fmt(ex.scannedAt)}</TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${ex.resolvedStatus === "open" ? "bg-red-100 text-red-700" : ex.resolvedStatus === "resolved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                            {ex.resolvedStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ex.resolvedStatus === "open" && (
                            <div className="flex gap-1">
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                                onClick={() => { setSelectedEx(ex); setResolveOpen(true); }}>
                                Resolve
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2"
                                onClick={() => ignoreMutation.mutate(ex.id)}>
                                Ignore
                              </Button>
                            </div>
                          )}
                          {ex.resolvedStatus === "resolved" && (
                            <p className="text-xs text-gray-400">by {ex.resolvedBy}</p>
                          )}
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

      {/* Resolve Dialog */}
      {selectedEx && (
        <Dialog open={resolveOpen} onOpenChange={v => { setResolveOpen(v); if (!v) { setSelectedEx(null); setResolvedBy(""); setResolveNotes(""); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Resolve Exception
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Exception detail card */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{EXCEPTION_ICONS[selectedEx.exceptionType]}</span>
                  <span className="font-semibold text-red-800 text-sm">{selectedEx.exceptionNumber}</span>
                  <Badge className={`${EXCEPTION_COLORS[selectedEx.exceptionType] ?? ""} border-0 text-xs`}>
                    {EXCEPTION_LABELS[selectedEx.exceptionType] ?? selectedEx.exceptionType}
                  </Badge>
                </div>
                <p className="text-sm text-red-700 mb-2">{selectedEx.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-red-600">
                  <div><span className="text-red-400">Scanned:</span> <span className="font-mono">{selectedEx.scannedValue ?? "—"}</span></div>
                  <div><span className="text-red-400">Scan type:</span> {selectedEx.scanType}</div>
                  <div><span className="text-red-400">Location:</span> {selectedEx.locationName ?? "—"}</div>
                  <div><span className="text-red-400">Detected:</span> {fmt(selectedEx.scannedAt)}</div>
                </div>
              </div>

              {/* Resolution inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Your name / operator ID *</label>
                  <Input value={resolvedBy} onChange={e => setResolvedBy(e.target.value)}
                    placeholder="e.g. QC Manager / Warehouse Supervisor" className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Resolution notes</label>
                  <Textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)}
                    placeholder="Describe what was done to resolve this exception, e.g. 'Tag was re-mapped to the correct HU' or 'Duplicate scan confirmed — no stock impact'" rows={3} className="text-xs resize-none" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setResolveOpen(false)}>Cancel</Button>
              <Button size="sm" disabled={!resolvedBy || resolveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => resolveMutation.mutate({ id: selectedEx.id, resolvedBy, notes: resolveNotes })}>
                {resolveMutation.isPending ? "Resolving..." : "Mark as Resolved"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
