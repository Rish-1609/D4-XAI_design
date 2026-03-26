import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MovementLedgerEntry } from "@shared/schema";
import {
  ArrowDownToLine, Layers, ArrowRightLeft, FlaskConical, Factory,
  ArrowUpFromLine, ShieldAlert, RotateCcw, ArrowRight, Search,
  Scan, ScanLine, Clock, BarChart2, TrendingUp, TrendingDown, Package2
} from "lucide-react";
import { Link } from "wouter";

const MVT_META: Record<string, { label: string; icon: typeof ArrowDownToLine; color: string; textColor: string; bgColor: string; }> = {
  stock_in: { label: "Stock In", icon: ArrowDownToLine, color: "bg-green-100 text-green-800", textColor: "text-green-700", bgColor: "bg-green-50 border-green-200" },
  putaway: { label: "Putaway", icon: Layers, color: "bg-blue-100 text-blue-800", textColor: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  internal_transfer: { label: "Transfer", icon: ArrowRightLeft, color: "bg-indigo-100 text-indigo-800", textColor: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200" },
  issue_to_production: { label: "Issue", icon: FlaskConical, color: "bg-amber-100 text-amber-800", textColor: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  production_receipt: { label: "Prod. Receipt", icon: Factory, color: "bg-teal-100 text-teal-800", textColor: "text-teal-700", bgColor: "bg-teal-50 border-teal-200" },
  stock_out: { label: "Stock Out", icon: ArrowUpFromLine, color: "bg-orange-100 text-orange-800", textColor: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" },
  QC_hold: { label: "QC Hold/Release", icon: ShieldAlert, color: "bg-purple-100 text-purple-800", textColor: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  cycle_count: { label: "Cycle Count", icon: RotateCcw, color: "bg-rose-100 text-rose-800", textColor: "text-rose-700", bgColor: "bg-rose-50 border-rose-200" },
};

function fmt(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StockMovements() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scanFilter, setScanFilter] = useState("all");

  const { data: movements = [], isLoading } = useQuery<MovementLedgerEntry[]>({ queryKey: ["/api/traceability/movements"] });

  const stats = {
    total: movements.length,
    today: movements.filter(m => m.movedAt && new Date(m.movedAt).toDateString() === new Date().toDateString()).length,
    stockIn: movements.filter(m => m.movementType === "stock_in").length,
    stockOut: movements.filter(m => m.movementType === "stock_out").length,
    transfers: movements.filter(m => m.movementType === "internal_transfer" || m.movementType === "putaway").length,
    production: movements.filter(m => m.movementType === "issue_to_production" || m.movementType === "production_receipt").length,
  };

  // Volume by type for mini chart
  const typeBreakdown = Object.entries(MVT_META).map(([key, meta]) => ({
    key, label: meta.label, count: movements.filter(m => m.movementType === key).length,
    color: meta.textColor,
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  const filtered = movements.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (m.movementNumber ?? "").toLowerCase().includes(q) ||
      (m.huCode ?? "").toLowerCase().includes(q) ||
      (m.materialName ?? "").toLowerCase().includes(q) ||
      (m.materialCode ?? "").toLowerCase().includes(q) ||
      (m.batchNumber ?? "").toLowerCase().includes(q) ||
      (m.sourceDocNumber ?? "").toLowerCase().includes(q) ||
      (m.performedBy ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || m.movementType === typeFilter;
    const matchScan = scanFilter === "all" || m.scanMethod === scanFilter;
    return matchSearch && matchType && matchScan;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
              <p className="text-sm text-gray-500 mt-0.5">Full movement ledger — every stock transaction posted from the Transactions page with document reference and audit trail</p>
            </div>
            <Link href="/inventory-transactions">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Post New Transaction
              </Button>
            </Link>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
            {[
              { label: "Total Movements", value: stats.total, icon: BarChart2, color: "text-gray-700", bg: "bg-white border-gray-200" },
              { label: "Today", value: stats.today, icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
              { label: "Stock In", value: stats.stockIn, icon: TrendingDown, color: "text-green-600", bg: "bg-green-50 border-green-200" },
              { label: "Stock Out", value: stats.stockOut, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
              { label: "Transfers", value: stats.transfers, icon: ArrowRightLeft, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
              { label: "Production", value: stats.production, icon: Package2, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <div>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Type volume breakdown */}
          {typeBreakdown.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Movement Volume by Type</p>
              <div className="flex gap-4 flex-wrap">
                {typeBreakdown.map(t => {
                  const pct = Math.round((t.count / stats.total) * 100);
                  const meta = MVT_META[t.key];
                  const Icon = meta.icon;
                  return (
                    <div key={t.key} className="flex items-center gap-2 cursor-pointer" onClick={() => setTypeFilter(t.key)}>
                      <div className={`${meta.bgColor} border rounded-lg p-1.5`}>
                        <Icon className={`h-3.5 w-3.5 ${t.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                        <p className="text-xs text-gray-400">{t.count} ({pct}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search movement #, HU code, material, batch, document, operator..."
                className="pl-8 h-8 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-44"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Movement Types</SelectItem>
                {Object.entries(MVT_META).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={scanFilter} onValueChange={setScanFilter}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All scans" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Scan Methods</SelectItem>
                {["manual", "barcode", "rfid", "api"].map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {(typeFilter !== "all" || scanFilter !== "all" || search) && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-gray-400" onClick={() => { setTypeFilter("all"); setScanFilter("all"); setSearch(""); }}>
                Clear filters
              </Button>
            )}
          </div>

          {/* Ledger table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-gray-400 text-sm">Loading movement ledger...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  {movements.length === 0
                    ? "No movements yet — post your first transaction from the Transactions page"
                    : "No movements match current filters"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Mvt #</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">HU Code</TableHead>
                      <TableHead className="text-xs">Material</TableHead>
                      <TableHead className="text-xs">Batch</TableHead>
                      <TableHead className="text-xs">Qty</TableHead>
                      <TableHead className="text-xs">From → To Location</TableHead>
                      <TableHead className="text-xs">Source Document</TableHead>
                      <TableHead className="text-xs">Scan</TableHead>
                      <TableHead className="text-xs">Status Change</TableHead>
                      <TableHead className="text-xs">Operator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(m => {
                      const meta = MVT_META[m.movementType];
                      const Icon = meta?.icon ?? ArrowRightLeft;
                      return (
                        <TableRow key={m.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">{m.movementNumber}</TableCell>
                          <TableCell className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(m.movedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {meta && <Icon className={`h-3.5 w-3.5 ${meta.textColor}`} />}
                              <Badge className={`border-0 text-xs ${meta?.color ?? "bg-gray-100 text-gray-600"}`}>
                                {meta?.label ?? m.movementType.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-blue-700">{m.huCode ?? "—"}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs font-medium text-gray-800 max-w-[120px] truncate">{m.materialName ?? m.materialCode ?? "—"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">{m.batchNumber ?? "—"}</TableCell>
                          <TableCell className="text-xs font-semibold text-gray-700">{m.quantity} {m.uom ?? ""}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                              <span className="text-gray-400">{m.fromLocationName ?? m.fromLocationCode ?? "—"}</span>
                              {(m.toLocationName ?? m.toLocationCode) && (
                                <>
                                  <ArrowRight className="h-3 w-3 text-gray-300" />
                                  <span>{m.toLocationName ?? m.toLocationCode}</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.sourceDocNumber ? (
                              <div>
                                <p className="font-mono text-xs font-semibold text-violet-700">{m.sourceDocNumber}</p>
                                <p className="text-xs text-gray-400">{(m.sourceDocType ?? "").replace(/_/g, " ")}</p>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {m.scanMethod === "barcode" ? <Scan className="h-3 w-3 text-green-500" /> :
                               m.scanMethod === "rfid" ? <ScanLine className="h-3 w-3 text-purple-500" /> : null}
                              <span className="text-xs capitalize text-gray-500">{m.scanMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {m.statusBefore && m.statusAfter ? (
                              <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                                <span className="text-gray-400">{m.statusBefore}</span>
                                <ArrowRight className="h-3 w-3 text-gray-300" />
                                <span className={`font-semibold ${m.statusAfter === "available" ? "text-green-700" : m.statusAfter?.includes("hold") ? "text-purple-700" : m.statusAfter === "dispatched" ? "text-gray-500" : "text-blue-700"}`}>
                                  {m.statusAfter}
                                </span>
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{m.performedBy ?? "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-gray-400 mt-3 text-right">Showing {filtered.length} of {movements.length} movements</p>
        </div>
      </div>
    </div>
  );
}
