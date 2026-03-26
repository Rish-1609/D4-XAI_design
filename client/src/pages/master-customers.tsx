import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Building2, Users, TrendingUp, AlertTriangle, Edit2 } from "lucide-react";

// SOP: CUS-001 — Customer Master Data Management; doc rev 1.1 approved 2026-01-20

type Customer = {
  id: string;
  customerCode: string;
  name: string;
  type: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  drugLicense?: string;
  creditLimit?: string;
  paymentTermsDays?: number;
  totalOrders?: number;
  totalValue?: string;
  status: string;
  notes?: string;
};

// Static seed data — customers (fetched from /api/master/customers in a real DB build)
const SEED_CUSTOMERS: Customer[] = [
  { id: "c1",  customerCode: "CUS-001", name: "APOLLO PHARMACY LTD",         type: "Retail Chain",          contactPerson: "Priya Menon",    email: "priya@apollopharmacy.in", phone: "+91-9001234567", address: "Apollo Health City, Jubilee Hills, Hyderabad - 500033", gstin: "36AABCA1234F1ZK", drugLicense: "AP/DL/2020/00123", creditLimit: "5000000", paymentTermsDays: 30, totalOrders: 284, totalValue: "28500000", status: "active", notes: "A-grade distributor; priority fulfillment" },
  { id: "c2",  customerCode: "CUS-002", name: "MEDPLUS HEALTH SERVICES",      type: "Retail Chain",          contactPerson: "Sanjay Agarwal", email: "sanjay@medplus.in",       phone: "+91-9112345678", address: "3rd Floor, Tower-B, Mindspace IT Park, Hyderabad - 500081", gstin: "36AABCM5678G1ZX", drugLicense: "AP/DL/2019/00456", creditLimit: "3000000", paymentTermsDays: 30, totalOrders: 198, totalValue: "16400000", status: "active", notes: "Prefers monthly invoicing" },
  { id: "c3",  customerCode: "CUS-003", name: "SHREYA MEDICAL DISTRIBUTORS",  type: "Distributor",           contactPerson: "Mohan Lal",      email: "mohan@shreyadist.com",    phone: "+91-9223456789", address: "48, Chawri Bazaar, New Delhi - 110006",              gstin: "07AABCS9012H1ZP", drugLicense: "DL/DL/2021/00789", creditLimit: "2000000", paymentTermsDays: 45, totalOrders: 143, totalValue: "9800000",  status: "active", notes: "North India coverage" },
  { id: "c4",  customerCode: "CUS-004", name: "RAJLAXMI PHARMA AGENCIES",     type: "C&F Agent",             contactPerson: "Ramesh Rao",     email: "ramesh@rajlaxmi.com",     phone: "+91-9334567890", address: "Plot 22, APMC Market Yard, Pune - 411018",           gstin: "27AABCR3456I1ZR", drugLicense: "MH/DL/2020/01234", creditLimit: "1500000", paymentTermsDays: 45, totalOrders: 95,  totalValue: "6200000",  status: "active", notes: "Maharashtra region C&F" },
  { id: "c5",  customerCode: "CUS-005", name: "BANGALORE MEDICAL STORES",     type: "Wholesaler",            contactPerson: "Kavita Shetty",  email: "kavita@bmspharm.com",     phone: "+91-9445678901", address: "78-B, Benson Town, Bangalore - 560046",              gstin: "29AABCB7890J1ZS", drugLicense: "KA/DL/2022/02345", creditLimit: "1000000", paymentTermsDays: 60, totalOrders: 67,  totalValue: "3900000",  status: "active", notes: "Karnataka coverage" },
  { id: "c6",  customerCode: "CUS-006", name: "GOVT MEDICAL COLLEGE HOSP.",   type: "Government Institution",contactPerson: "Dr. Aarti Singh", email: "aarti.singh@gmch.gov.in",phone: "+91-9556789012", address: "Government Medical College, Nagpur - 440009",        gstin: "27AABCG1234K1ZT", drugLicense: "MH/INS/2019/00100", creditLimit: "10000000", paymentTermsDays: 90, totalOrders: 52, totalValue: "22100000", status: "active", notes: "Tender-based procurement; GEM portal orders" },
  { id: "c7",  customerCode: "CUS-007", name: "SANJIVANI DRUG HOUSE",         type: "Distributor",           contactPerson: "Vinod Kumar",    email: "vinod@sanjivani.com",     phone: "+91-9667890123", address: "32, Station Road, Lucknow - 226001",                 gstin: "09AABCS5678L1ZU", drugLicense: "UP/DL/2020/03456", creditLimit: "800000",  paymentTermsDays: 45, totalOrders: 41,  totalValue: "2100000",  status: "active", notes: "UP region" },
  { id: "c8",  customerCode: "CUS-008", name: "VIJAY MEDICAL SUPPLIES",       type: "Wholesaler",            contactPerson: "Sunil Mehta",    email: "sunil@vijaymed.com",      phone: "+91-9778901234", address: "12, Mahatma Gandhi Road, Surat - 395003",            gstin: "24AABCV9012M1ZV", drugLicense: "GJ/DL/2021/04567", creditLimit: "500000",  paymentTermsDays: 60, totalOrders: 28,  totalValue: "1200000",  status: "inactive", notes: "Inactive since Q3 2025" },
  { id: "c9",  customerCode: "CUS-009", name: "HEALTHLINE PHARMACY CHAIN",    type: "Retail Chain",          contactPerson: "Deepa R.",       email: "deepa@healthline.in",     phone: "+91-9889012345", address: "501 Magnolia Mall, Bhopal - 462011",                 gstin: "23AABCH3456N1ZW", drugLicense: "MP/DL/2023/05678", creditLimit: "1200000", paymentTermsDays: 30, totalOrders: 77,  totalValue: "5600000",  status: "active",   notes: "Fast-growing chain; monthly credit review" },
  { id: "c10", customerCode: "CUS-010", name: "EXPORT MEDS GLOBAL PVT LTD",  type: "Export",                contactPerson: "Farhan Siddiqui",email: "farhan@exportmeds.com",  phone: "+91-9990123456", address: "Unit 3, SEEPZ SEZ, Andheri East, Mumbai - 400096",  gstin: "27AABCE7890O1ZX", drugLicense: "MH/EXP/2020/00001", creditLimit: "20000000", paymentTermsDays: 60, totalOrders: 34, totalValue: "45000000", status: "active",   notes: "Exports to Africa & SE Asia; requires CoA, stability data" },
];

const typeColors: Record<string, string> = {
  "Retail Chain": "bg-blue-100 text-blue-700",
  "Distributor":  "bg-violet-100 text-violet-700",
  "Wholesaler":   "bg-amber-100 text-amber-700",
  "C&F Agent":    "bg-cyan-100 text-cyan-700",
  "Government Institution": "bg-emerald-100 text-emerald-700",
  "Export":       "bg-pink-100 text-pink-700",
};

const statusBadge = (s: string) =>
  s === "active"   ? <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>
  : s === "inactive" ? <Badge className="bg-gray-100 text-gray-600 border-0">Inactive</Badge>
  :                    <Badge className="bg-red-100 text-red-700 border-0">Blocked</Badge>;

const fmt = (v?: string) => v ? "₹" + parseFloat(v).toLocaleString("en-IN") : "—";

const TYPES = ["Retail Chain","Distributor","Wholesaler","C&F Agent","Government Institution","Export","Hospital","Clinic"];

function CustomerForm({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { toast } = useToast();
  const isEdit = !!customer;
  const [form, setForm] = useState({
    customerCode: customer?.customerCode ?? "",
    name: customer?.name ?? "",
    type: customer?.type ?? "Distributor",
    contactPerson: customer?.contactPerson ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    gstin: customer?.gstin ?? "",
    drugLicense: customer?.drugLicense ?? "",
    creditLimit: customer?.creditLimit ?? "500000",
    paymentTermsDays: customer?.paymentTermsDays ?? 30,
    status: customer?.status ?? "active",
    notes: customer?.notes ?? "",
  });

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: isEdit ? "Customer updated" : "Customer created", description: "Changes saved successfully." });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Customer Code *</Label><Input value={form.customerCode} onChange={f("customerCode")} placeholder="CUS-XXX" required /></div>
        <div><Label>Type *</Label><Select value={form.type} onValueChange={v=>setForm(p=>({...p,type:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div><Label>Customer Name *</Label><Input value={form.name} onChange={f("name")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={f("contactPerson")} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={f("phone")} /></div>
      </div>
      <div><Label>Email</Label><Input value={form.email} onChange={f("email")} type="email" /></div>
      <div><Label>Address</Label><Input value={form.address} onChange={f("address")} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>GSTIN</Label><Input value={form.gstin} onChange={f("gstin")} /></div>
        <div><Label>Drug License No.</Label><Input value={form.drugLicense} onChange={f("drugLicense")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Credit Limit (₹)</Label><Input value={form.creditLimit} onChange={f("creditLimit")} type="number" /></div>
        <div><Label>Payment Terms (days)</Label><Input value={form.paymentTermsDays} onChange={f("paymentTermsDays")} type="number" /></div>
      </div>
      <div><Label>Status</Label><Select value={form.status} onValueChange={v=>setForm(p=>({...p,status:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent></Select></div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={f("notes")} rows={2} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{isEdit ? "Update" : "Create Customer"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function MasterCustomers() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [customers] = useState(SEED_CUSTOMERS);

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.customerCode.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const types = [...new Set(customers.map(c => c.type))];
  const totalActive = customers.filter(c => c.status === "active").length;
  const totalValue = customers.reduce((sum, c) => sum + parseFloat(c.totalValue ?? "0"), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground text-sm">Customer master registry — SOP: CUS-001</p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length, icon: Building2, color: "text-blue-600" },
          { label: "Active",          value: totalActive,       icon: Users,     color: "text-emerald-600" },
          { label: "Inactive/Blocked",value: customers.length - totalActive, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Total Revenue",   value: "₹" + (totalValue/1e7).toFixed(1) + "Cr", icon: TrendingUp, color: "text-violet-600" },
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
          <Input placeholder="Search customers…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
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
                <TableHead>Customer Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Drug License</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead className="text-right">Pay. Terms</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No customers found.</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.customerCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    {c.contactPerson && <div className="text-xs text-muted-foreground">{c.contactPerson} · {c.phone}</div>}
                  </TableCell>
                  <TableCell><Badge className={`border-0 text-xs ${typeColors[c.type] ?? "bg-gray-100 text-gray-700"}`}>{c.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{c.drugLicense ?? "—"}</TableCell>
                  <TableCell className="text-right">{fmt(c.creditLimit)}</TableCell>
                  <TableCell className="text-right">{c.paymentTermsDays} days</TableCell>
                  <TableCell className="text-right">{c.totalOrders ?? "—"}</TableCell>
                  <TableCell className="text-right">{fmt(c.totalValue)}</TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setDialogOpen(true); }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Customer" : "New Customer"}</DialogTitle>
          </DialogHeader>
          <CustomerForm customer={selected ?? undefined} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
