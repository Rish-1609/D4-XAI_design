import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, FileText, CreditCard, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import type { Party, FinancialDocument, Payment } from "@shared/schema";

export default function FinanceTransactions() {
  const [activeTab, setActiveTab] = useState("documents");
  const { toast } = useToast();

  const { data: parties = [] } = useQuery<Party[]>({ queryKey: ["/api/finance/parties"] });
  const { data: documents = [] } = useQuery<FinancialDocument[]>({ queryKey: ["/api/finance/documents"] });
  const { data: payments = [] } = useQuery<Payment[]>({ queryKey: ["/api/finance/payments"] });

  const vendors = parties.filter(p => p.partyType === "vendor");
  const customers = parties.filter(p => p.partyType === "customer");

  const apInvoices = documents.filter(d => d.documentType === "vendor_invoice");
  const arInvoices = documents.filter(d => d.documentType === "customer_invoice");

  const totalPayables = apInvoices.reduce((sum, d) => sum + parseFloat(d.balanceAmount || "0"), 0);
  const totalReceivables = arInvoices.reduce((sum, d) => sum + parseFloat(d.balanceAmount || "0"), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Financial Transactions</h2>
              <p className="text-gray-600 text-sm mt-1">Unified AP/AR - Manage invoices, payments, and party accounts</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Payables</p>
                    <p className="text-2xl font-bold text-red-600">₹{totalPayables.toLocaleString()}</p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Receivables</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalReceivables.toLocaleString()}</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Vendors</p>
                    <p className="text-2xl font-bold">{vendors.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Customers</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents" data-testid="tab-documents">
                <FileText className="h-4 w-4 mr-2" /> Documents
              </TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">
                <CreditCard className="h-4 w-4 mr-2" /> Payments
              </TabsTrigger>
              <TabsTrigger value="parties" data-testid="tab-parties">
                <Users className="h-4 w-4 mr-2" /> Parties
              </TabsTrigger>
              <TabsTrigger value="aging" data-testid="tab-aging">
                <Clock className="h-4 w-4 mr-2" /> Aging Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <DocumentsTab />
            </TabsContent>
            <TabsContent value="payments">
              <PaymentsTab />
            </TabsContent>
            <TabsContent value="parties">
              <PartiesTab />
            </TabsContent>
            <TabsContent value="aging">
              <AgingReportTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function DocumentsTab() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState("vendor_invoice");

  const { data: documents = [], isLoading } = useQuery<FinancialDocument[]>({
    queryKey: ["/api/finance/documents"],
  });

  const { data: parties = [] } = useQuery<Party[]>({
    queryKey: ["/api/finance/parties"],
  });

  const [formData, setFormData] = useState({
    documentType: "vendor_invoice",
    documentNumber: "",
    partyId: "",
    documentDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    totalAmount: "0",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/finance/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/documents"] });
      setIsOpen(false);
      toast({ title: "Document created successfully" });
    },
  });

  const docTypes = [
    { value: "vendor_invoice", label: "Vendor Invoice", icon: TrendingUp, color: "bg-red-100 text-red-800" },
    { value: "customer_invoice", label: "Customer Invoice", icon: TrendingDown, color: "bg-green-100 text-green-800" },
    { value: "vendor_credit_note", label: "Vendor Credit Note", color: "bg-orange-100 text-orange-800" },
    { value: "customer_credit_note", label: "Customer Credit Note", color: "bg-blue-100 text-blue-800" },
    { value: "debit_note", label: "Debit Note", color: "bg-purple-100 text-purple-800" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Financial Documents</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-document"><Plus className="h-4 w-4 mr-2" /> New Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Financial Document</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                  <SelectTrigger data-testid="select-doc-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Number</Label>
                  <Input value={formData.documentNumber} onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })} data-testid="input-doc-number" />
                </div>
                <div className="space-y-2">
                  <Label>Party</Label>
                  <Select value={formData.partyId} onValueChange={(v) => setFormData({ ...formData, partyId: v })}>
                    <SelectTrigger data-testid="select-party"><SelectValue placeholder="Select party" /></SelectTrigger>
                    <SelectContent>
                      {parties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.partyType})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Date</Label>
                  <Input type="date" value={formData.documentDate} onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })} data-testid="input-doc-date" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} data-testid="input-due-date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total Amount (₹)</Label>
                <Input type="number" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} data-testid="input-amount" />
              </div>
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="btn-save-document">
                {createMutation.isPending ? "Creating..." : "Create Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Loading documents...</TableCell></TableRow>
            ) : documents.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No documents found. Create your first invoice.</TableCell></TableRow>
            ) : documents.map((doc) => {
              const party = parties.find(p => p.id === doc.partyId);
              const docTypeInfo = docTypes.find(t => t.value === doc.documentType);
              return (
                <TableRow key={doc.id} data-testid={`row-doc-${doc.id}`}>
                  <TableCell className="font-mono text-sm">{doc.documentNumber}</TableCell>
                  <TableCell><Badge className={docTypeInfo?.color}>{docTypeInfo?.label || doc.documentType}</Badge></TableCell>
                  <TableCell>{party?.name || "-"}</TableCell>
                  <TableCell>{new Date(doc.documentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(doc.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{parseFloat(doc.totalAmount || "0").toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{parseFloat(doc.balanceAmount || "0").toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={doc.paymentStatus === "paid" ? "default" : doc.paymentStatus === "partial" ? "secondary" : "outline"}>
                      {doc.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaymentsTab() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/finance/payments"],
  });

  const { data: parties = [] } = useQuery<Party[]>({
    queryKey: ["/api/finance/parties"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payments</CardTitle>
        <Button data-testid="btn-add-payment"><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment #</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading payments...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No payments recorded yet.</TableCell></TableRow>
            ) : payments.map((payment) => {
              const party = parties.find(p => p.id === payment.partyId);
              return (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                  <TableCell className="font-mono text-sm">{payment.paymentNumber}</TableCell>
                  <TableCell>{party?.name || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{payment.paymentType}</Badge></TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{parseFloat(payment.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PartiesTab() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", partyType: "vendor", email: "", phone: "", taxId: "", creditLimit: "0" });

  const { data: parties = [], isLoading } = useQuery<Party[]>({
    queryKey: ["/api/finance/parties"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/finance/parties", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/parties"] });
      setIsOpen(false);
      toast({ title: "Party created successfully" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vendors & Customers</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-party"><Plus className="h-4 w-4 mr-2" /> Add Party</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Vendor/Customer</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} data-testid="input-party-code" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.partyType} onValueChange={(v) => setFormData({ ...formData, partyType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-party-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} data-testid="input-party-email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-party-phone" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax ID (GSTIN)</Label>
                  <Input value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} data-testid="input-party-tax" />
                </div>
                <div className="space-y-2">
                  <Label>Credit Limit (₹)</Label>
                  <Input type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} data-testid="input-party-credit" />
                </div>
              </div>
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="btn-save-party">
                {createMutation.isPending ? "Creating..." : "Create Party"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tax ID</TableHead>
              <TableHead className="text-right">Credit Limit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : parties.map((party) => (
              <TableRow key={party.id} data-testid={`row-party-${party.id}`}>
                <TableCell className="font-mono">{party.code}</TableCell>
                <TableCell className="font-medium">{party.name}</TableCell>
                <TableCell><Badge variant={party.partyType === "vendor" ? "destructive" : "default"}>{party.partyType}</Badge></TableCell>
                <TableCell>{party.email || "-"}</TableCell>
                <TableCell className="font-mono text-sm">{party.taxId || "-"}</TableCell>
                <TableCell className="text-right font-mono">₹{parseFloat(party.creditLimit || "0").toLocaleString()}</TableCell>
                <TableCell><Badge variant={party.isActive ? "default" : "secondary"}>{party.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AgingReportTab() {
  const [partyType, setPartyType] = useState("vendor");

  const { data: agingData = [], isLoading } = useQuery<Array<{ partyId: string; partyName: string; current: number; days30: number; days60: number; days90: number; over90: number; total: number }>>({
    queryKey: ["/api/finance/analytics/aging-report", partyType],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aging Report</CardTitle>
        <Select value={partyType} onValueChange={setPartyType}>
          <SelectTrigger className="w-40" data-testid="select-aging-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vendor">Payables (AP)</SelectItem>
            <SelectItem value="customer">Receivables (AR)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Party</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">1-30 Days</TableHead>
              <TableHead className="text-right">31-60 Days</TableHead>
              <TableHead className="text-right">61-90 Days</TableHead>
              <TableHead className="text-right">90+ Days</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading aging data...</TableCell></TableRow>
            ) : agingData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No outstanding balances</TableCell></TableRow>
            ) : agingData.map((row) => (
              <TableRow key={row.partyId} data-testid={`row-aging-${row.partyId}`}>
                <TableCell className="font-medium">{row.partyName}</TableCell>
                <TableCell className="text-right font-mono">₹{row.current.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">₹{row.days30.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-yellow-600">₹{row.days60.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-orange-600">₹{row.days90.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-red-600">₹{row.over90.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold">₹{row.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
