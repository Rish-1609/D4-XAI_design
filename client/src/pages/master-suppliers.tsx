import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Star, Truck, ShieldCheck, PackageSearch, Edit2, Ban, CheckCircle2 } from "lucide-react";

// SOP: SUP-001 — Supplier Master Data Management; doc rev 1.3 approved QA 2026-01-15

type Supplier = {
  id: string;
  supplierCode: string;
  name: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  rating: string;
  onTimeDelivery: string;
  qualityScore: string;
  totalOrders: number;
  totalValue: string;
  status: string;
  blockedReason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

const CATEGORIES = ["Packaging Material", "Raw Material", "Active Pharmaceutical Ingredient", "Excipient", "Contract Services", "Equipment"];
const STATUSES = ["active", "blocked", "inactive"];

const statusBadge = (s: string) => {
  if (s === "active")   return <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>;
  if (s === "blocked")  return <Badge className="bg-red-100 text-red-700 border-0">Blocked</Badge>;
  return                       <Badge className="bg-gray-100 text-gray-600 border-0">Inactive</Badge>;
};

const starRating = (r: string) => {
  const n = parseFloat(r);
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{n.toFixed(1)}</span>
    </span>
  );
};

const fmt = (n: string | number) => "₹" + parseFloat(String(n)).toLocaleString("en-IN");

function SupplierForm({ supplier, onClose }: { supplier?: Supplier; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    supplierCode: supplier?.supplierCode ?? "",
    name: supplier?.name ?? "",
    category: supplier?.category ?? "Raw Material",
    contactPerson: supplier?.contactPerson ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    country: supplier?.country ?? "India",
    rating: supplier?.rating ?? "4.0",
    onTimeDelivery: supplier?.onTimeDelivery ?? "90.0",
    qualityScore: supplier?.qualityScore ?? "90.0",
    status: supplier?.status ?? "active",
    notes: supplier?.notes ?? "",
  });

  const mut = useMutation({
    mutationFn: (d: typeof form) =>
      isEdit
        ? apiRequest("PUT", `/api/master/suppliers/${supplier!.id}`, d)
        : apiRequest("POST", "/api/master/suppliers", d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/suppliers"] });
      toast({ title: isEdit ? "Supplier updated" : "Supplier created" });
      onClose();
    },
    onError: () => toast({ title: "Error", description: "Failed to save supplier.", variant: "destructive" }),
  });

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));
  const s = (e: React.FormEvent) => { e.preventDefault(); mut.mutate(form); };

  return (
    <form onSubmit={s} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Supplier Code *</Label><Input value={form.supplierCode} onChange={f("supplierCode")} placeholder="SUP-XXX" required /></div>
        <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p=>({...p, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div><Label>Supplier Name *</Label><Input value={form.name} onChange={f("name")} required /></div>
      <div><Label>Category *</Label><Select value={form.category} onValueChange={v => setForm(p=>({...p, category: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={f("contactPerson")} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={f("phone")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Email</Label><Input value={form.email} onChange={f("email")} type="email" /></div>
        <div><Label>Country</Label><Input value={form.country} onChange={f("country")} /></div>
      </div>
      <div><Label>Address</Label><Input value={form.address} onChange={f("address")} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Rating (0–5)</Label><Input value={form.rating} onChange={f("rating")} type="number" step="0.1" min="0" max="5" /></div>
        <div><Label>On-Time Delivery %</Label><Input value={form.onTimeDelivery} onChange={f("onTimeDelivery")} type="number" step="0.1" /></div>
        <div><Label>Quality Score %</Label><Input value={form.qualityScore} onChange={f("qualityScore")} type="number" step="0.1" /></div>
      </div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={f("notes")} rows={2} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Saving…" : isEdit ? "Update Supplier" : "Create Supplier"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function MasterSuppliers() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockDialog, setBlockDialog] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({ queryKey: ["/api/master/suppliers"] });
  const { data: stats } = useQuery<{ total: number; active: number; blocked: number; avgRating: number }>({
    queryKey: ["/api/master/suppliers/stats"],
  });

  const blockMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PUT", `/api/master/suppliers/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/suppliers"] });
      toast({ title: "Supplier status updated" });
      setBlockDialog(null);
    },
  });

  const filtered = suppliers.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.supplierCode.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || s.category === catFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const categories = [...new Set(suppliers.map(s => s.category))];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground text-sm">Master supplier registry — SOP: SUP-001</p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Supplier
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Suppliers", value: stats?.total ?? "-", icon: PackageSearch, color: "text-blue-600" },
          { label: "Active",          value: stats?.active ?? "-",   icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Blocked",         value: stats?.blocked ?? "-",  icon: Ban,          color: "text-red-600" },
          { label: "Avg Rating",      value: stats ? `${stats.avgRating} / 5` : "-", icon: Star, color: "text-amber-500" },
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
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search suppliers…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-center"><Truck className="w-4 h-4 inline mr-1" />On-Time %</TableHead>
                <TableHead className="text-center"><ShieldCheck className="w-4 h-4 inline mr-1" />Quality %</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Loading suppliers…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No suppliers found.</TableCell></TableRow>
              ) : filtered.map(sup => (
                <TableRow key={sup.id} className={sup.status === "blocked" ? "bg-red-50/40" : ""}>
                  <TableCell className="font-mono text-xs">{sup.supplierCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{sup.name}</div>
                    {sup.contactPerson && <div className="text-xs text-muted-foreground">{sup.contactPerson}</div>}
                    {sup.status === "blocked" && sup.blockedReason && (
                      <div className="text-xs text-red-600 mt-0.5 max-w-xs truncate">{sup.blockedReason}</div>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{sup.category}</Badge></TableCell>
                  <TableCell>{starRating(sup.rating)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold text-sm ${parseFloat(sup.onTimeDelivery) >= 95 ? "text-emerald-600" : parseFloat(sup.onTimeDelivery) >= 85 ? "text-amber-600" : "text-red-600"}`}>
                      {parseFloat(sup.onTimeDelivery).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold text-sm ${parseFloat(sup.qualityScore) >= 95 ? "text-emerald-600" : parseFloat(sup.qualityScore) >= 85 ? "text-amber-600" : "text-red-600"}`}>
                      {parseFloat(sup.qualityScore).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{sup.totalOrders}</TableCell>
                  <TableCell className="text-right">{fmt(sup.totalValue)}</TableCell>
                  <TableCell>{statusBadge(sup.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setSelected(sup); setDialogOpen(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost"
                        className={sup.status === "blocked" ? "text-emerald-600" : "text-red-600"}
                        onClick={() => setBlockDialog(sup)}>
                        {sup.status === "blocked" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Supplier" : "New Supplier"}</DialogTitle>
          </DialogHeader>
          <SupplierForm supplier={selected ?? undefined} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Block/Unblock dialog */}
      <Dialog open={!!blockDialog} onOpenChange={() => setBlockDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blockDialog?.status === "blocked" ? "Unblock Supplier" : "Block Supplier"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {blockDialog?.status === "blocked"
              ? `Are you sure you want to unblock ${blockDialog?.name}?`
              : `Are you sure you want to block ${blockDialog?.name}? This will prevent new POs from being raised.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog(null)}>Cancel</Button>
            <Button
              variant={blockDialog?.status === "blocked" ? "default" : "destructive"}
              disabled={blockMut.isPending}
              onClick={() => blockDialog && blockMut.mutate({ id: blockDialog.id, status: blockDialog.status === "blocked" ? "active" : "blocked" })}>
              {blockMut.isPending ? "Saving…" : blockDialog?.status === "blocked" ? "Unblock" : "Block Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
