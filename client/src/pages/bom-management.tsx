import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Plus, Search, FileText, Package, Layers, DollarSign, Copy } from "lucide-react";

// SOP: BOM-001 — Bill of Materials Master Creation and Approval; doc rev 2.1 approved QA/R&D 2026-02-01
// All pharma BOM and component data seeded in server/storage.ts §initializeDummyData — see bomData / bomMaterialsData.

type Bom = {
  id: string;
  bomNumber: string;
  name: string;
  productCode: string;
  productName: string;
  version: string;
  status: string;
  batchSize: number;
  batchSizeUom: string;
  totalCost?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BomItem = {
  id: string;
  bomId: string;
  materialCode: string;
  materialName: string;
  materialType?: string;
  labelClaim?: string;
  quantity: string;
  uom: string;
  scrapPercentage?: string;
  overagePercent?: string;
  unitCost?: string;
  totalCost?: string;
  supplierCode?: string;
  isCritical?: boolean;
  sequenceNumber?: number;
};

const statusBadge = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "active")   return <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>;
  if (sl === "draft")    return <Badge className="bg-amber-100 text-amber-700 border-0">Draft</Badge>;
  return <Badge className="bg-gray-100 text-gray-500 border-0">Archived</Badge>;
};

const materialTypeBadge = (t?: string) => {
  if (t === "RM") return <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">RM</Badge>;
  if (t === "PM") return <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">PM</Badge>;
  if (t === "FG") return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">FG</Badge>;
  return <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">{t ?? "RM"}</Badge>;
};

const fmt = (v?: string | number) => {
  if (v == null) return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const qty = (v?: string | number, uom?: string) => {
  if (v == null) return "—";
  const n = parseFloat(String(v));
  return `${isNaN(n) ? "—" : n.toLocaleString("en-IN")} ${uom ?? ""}`.trim();
};

function BomItemsTable({ bomId }: { bomId: string }) {
  const { data: items = [], isLoading } = useQuery<BomItem[]>({ queryKey: [`/api/boms/${bomId}/materials`] });

  if (isLoading) return <div className="py-4 px-6 text-sm text-muted-foreground">Loading components…</div>;
  if (items.length === 0) return <div className="py-4 px-6 text-sm text-muted-foreground italic">No components defined for this BOM.</div>;

  const totalRaw = items.reduce((s, i) => s + parseFloat(i.totalCost ?? "0"), 0);

  return (
    <div className="border-t bg-slate-50/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100/70">
            <TableHead className="w-8 pl-8">#</TableHead>
            <TableHead>Material Code</TableHead>
            <TableHead>Component Name</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead>Label Claim</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Scrap %</TableHead>
            <TableHead className="text-right">Overage %</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Total Cost</TableHead>
            <TableHead>Supplier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id} className="hover:bg-white/80">
              <TableCell className="text-xs text-muted-foreground pl-8">{item.sequenceNumber ?? idx + 1}</TableCell>
              <TableCell className="font-mono text-xs">{item.materialCode}</TableCell>
              <TableCell>
                <span className="font-medium text-sm">{item.materialName}</span>
                {item.isCritical && <Badge className="ml-2 text-xs bg-red-100 text-red-700 border-0">Critical</Badge>}
              </TableCell>
              <TableCell className="text-center">{materialTypeBadge(item.materialType)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{item.labelClaim ?? "—"}</TableCell>
              <TableCell className="text-right text-sm">{qty(item.quantity, item.uom)}</TableCell>
              <TableCell className="text-right text-sm">
                <span className={parseFloat(item.scrapPercentage ?? "0") > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                  {parseFloat(item.scrapPercentage ?? "0").toFixed(1)}%
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {parseFloat(item.overagePercent ?? "0").toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-sm">{fmt(item.unitCost)}</TableCell>
              <TableCell className="text-right font-medium text-sm">{fmt(item.totalCost)}</TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">{item.supplierCode ?? "—"}</TableCell>
            </TableRow>
          ))}
          {/* Summary footer */}
          <TableRow className="bg-slate-100/80 font-semibold">
            <TableCell colSpan={9} className="text-right text-sm pl-8">Total Component Cost</TableCell>
            <TableCell className="text-right text-sm text-blue-700">{fmt(totalRaw)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default function BomManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["bom1"]));
  const { toast } = useToast();

  const { data: boms = [], isLoading } = useQuery<Bom[]>({ queryKey: ["/api/boms"] });

  const filtered = boms.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bomNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.productCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const active = boms.filter(b => b.status?.toLowerCase() === "active").length;
  const draft  = boms.filter(b => b.status?.toLowerCase() === "draft").length;
  const totalCost = boms.reduce((s, b) => s + parseFloat(b.totalCost ?? "0"), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BOM Management</h1>
          <p className="text-muted-foreground text-sm">Pharma Bill of Materials — SOP: BOM-001 rev 2.1</p>
        </div>
        <Button onClick={() => toast({ title: "Coming soon", description: "New BOM creation wizard in next release." })}>
          <Plus className="w-4 h-4 mr-2" /> New BOM
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total BOMs",   value: boms.length, icon: Layers,      color: "text-blue-600" },
          { label: "Active BOMs",  value: active,      icon: FileText,    color: "text-emerald-600" },
          { label: "Draft BOMs",   value: draft,       icon: Package,     color: "text-amber-600" },
          { label: "Avg BOM Cost", value: boms.length > 0 ? fmt(totalCost / boms.length) : "—", icon: DollarSign, color: "text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by BOM number, product name, code…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setExpandedIds(new Set(filtered.map(b => b.id)))}>Expand All</Button>
        <Button variant="outline" onClick={() => setExpandedIds(new Set())}>Collapse All</Button>
      </div>

      {/* BOM list with expandable component rows */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading BOMs…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No BOMs found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>BOM Number</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead className="text-center">Version</TableHead>
                  <TableHead className="text-right">Batch Size</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(bom => {
                  const isOpen = expandedIds.has(bom.id);
                  return (
                    <>
                      <TableRow
                        key={bom.id}
                        className="cursor-pointer hover:bg-blue-50/40 font-medium"
                        onClick={() => toggle(bom.id)}
                      >
                        <TableCell className="w-8">
                          {isOpen
                            ? <ChevronDown className="w-4 h-4 text-blue-500" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{bom.bomNumber}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{bom.productName}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{bom.productCode}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">v{bom.version}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {bom.batchSize?.toLocaleString()} {bom.batchSizeUom}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-700">
                          {fmt(bom.totalCost)}
                        </TableCell>
                        <TableCell>{statusBadge(bom.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{bom.approvedBy ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {bom.updatedAt ? new Date(bom.updatedAt).toLocaleDateString("en-IN") : "—"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); toast({ title: `Copy BOM ${bom.bomNumber}`, description: "BOM cloning coming soon." }); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow key={`${bom.id}-items`} className="hover:bg-transparent">
                          <TableCell colSpan={11} className="p-0">
                            <BomItemsTable bomId={bom.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
      </div>
    </div>
  );
}
