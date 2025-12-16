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
import { Plus, Edit, Trash2, DollarSign, Building2, Target, Receipt, Calendar, CreditCard, Settings } from "lucide-react";
import type { ChartOfAccounts, CostCenter, ProfitCenter, TaxCode, PaymentTerms, FiscalYear, FiscalPeriod } from "@shared/schema";

export default function FinanceSetup() {
  const [activeTab, setActiveTab] = useState("chart-of-accounts");
  const { toast } = useToast();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Financial Setup</h2>
              <p className="text-gray-600 text-sm mt-1">Configure chart of accounts, cost centers, tax codes, and fiscal calendar</p>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 gap-2">
              <TabsTrigger value="chart-of-accounts" className="text-xs" data-testid="tab-chart-of-accounts">
                <DollarSign className="h-4 w-4 mr-1" /> Accounts
              </TabsTrigger>
              <TabsTrigger value="cost-centers" className="text-xs" data-testid="tab-cost-centers">
                <Building2 className="h-4 w-4 mr-1" /> Cost Centers
              </TabsTrigger>
              <TabsTrigger value="profit-centers" className="text-xs" data-testid="tab-profit-centers">
                <Target className="h-4 w-4 mr-1" /> Profit Centers
              </TabsTrigger>
              <TabsTrigger value="tax-codes" className="text-xs" data-testid="tab-tax-codes">
                <Receipt className="h-4 w-4 mr-1" /> Tax Codes
              </TabsTrigger>
              <TabsTrigger value="payment-terms" className="text-xs" data-testid="tab-payment-terms">
                <CreditCard className="h-4 w-4 mr-1" /> Payment Terms
              </TabsTrigger>
              <TabsTrigger value="fiscal-calendar" className="text-xs" data-testid="tab-fiscal-calendar">
                <Calendar className="h-4 w-4 mr-1" /> Fiscal Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart-of-accounts">
              <ChartOfAccountsTab />
            </TabsContent>
            <TabsContent value="cost-centers">
              <CostCentersTab />
            </TabsContent>
            <TabsContent value="profit-centers">
              <ProfitCentersTab />
            </TabsContent>
            <TabsContent value="tax-codes">
              <TaxCodesTab />
            </TabsContent>
            <TabsContent value="payment-terms">
              <PaymentTermsTab />
            </TabsContent>
            <TabsContent value="fiscal-calendar">
              <FiscalCalendarTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function ChartOfAccountsTab() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountCode: "", accountName: "", accountType: "asset", accountSubType: "", normalBalance: "debit", description: ""
  });

  const { data: accounts = [], isLoading } = useQuery<ChartOfAccounts[]>({
    queryKey: ["/api/finance/chart-of-accounts"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/finance/chart-of-accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/chart-of-accounts"] });
      setIsOpen(false);
      setFormData({ accountCode: "", accountName: "", accountType: "asset", accountSubType: "", normalBalance: "debit", description: "" });
      toast({ title: "Account created successfully" });
    },
  });

  const accountTypes = [
    { value: "asset", label: "Asset", color: "bg-green-100 text-green-800" },
    { value: "liability", label: "Liability", color: "bg-red-100 text-red-800" },
    { value: "equity", label: "Equity", color: "bg-purple-100 text-purple-800" },
    { value: "revenue", label: "Revenue", color: "bg-blue-100 text-blue-800" },
    { value: "expense", label: "Expense", color: "bg-orange-100 text-orange-800" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chart of Accounts</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-account"><Plus className="h-4 w-4 mr-2" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Code</Label>
                  <Input value={formData.accountCode} onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })} placeholder="e.g., 1000" data-testid="input-account-code" />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} placeholder="e.g., Cash" data-testid="input-account-name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select value={formData.accountType} onValueChange={(v) => setFormData({ ...formData, accountType: v })}>
                    <SelectTrigger data-testid="select-account-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Normal Balance</Label>
                  <Select value={formData.normalBalance} onValueChange={(v) => setFormData({ ...formData, normalBalance: v })}>
                    <SelectTrigger data-testid="select-normal-balance"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sub Type</Label>
                <Input value={formData.accountSubType} onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })} placeholder="e.g., current_asset" data-testid="input-category" />
              </div>
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="btn-save-account">
                {createMutation.isPending ? "Creating..." : "Create Account"}
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
              <TableHead>Category</TableHead>
              <TableHead>Normal Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading accounts...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No accounts found</TableCell></TableRow>
            ) : accounts.map((account) => (
              <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                <TableCell className="font-mono text-sm">{account.accountCode}</TableCell>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell>
                  <Badge className={accountTypes.find(t => t.value === account.accountType)?.color || ""}>{account.accountType}</Badge>
                </TableCell>
                <TableCell>{account.accountSubType || "-"}</TableCell>
                <TableCell><Badge variant="outline">{account.normalBalance}</Badge></TableCell>
                <TableCell><Badge variant={account.isActive ? "default" : "secondary"}>{account.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CostCentersTab() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", type: "production", description: "" });

  const { data: costCenters = [], isLoading } = useQuery<CostCenter[]>({
    queryKey: ["/api/finance/cost-centers"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/finance/cost-centers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/cost-centers"] });
      setIsOpen(false);
      toast({ title: "Cost center created successfully" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cost Centers</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-cost-center"><Plus className="h-4 w-4 mr-2" /> Add Cost Center</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Cost Center</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} data-testid="input-cc-code" />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-cc-name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="btn-save-cost-center">
                {createMutation.isPending ? "Creating..." : "Create Cost Center"}
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
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : costCenters.map((cc) => (
              <TableRow key={cc.id} data-testid={`row-cc-${cc.id}`}>
                <TableCell className="font-mono">{cc.code}</TableCell>
                <TableCell className="font-medium">{cc.name}</TableCell>
                <TableCell><Badge variant="outline">{cc.type}</Badge></TableCell>
                <TableCell><Badge variant={cc.isActive ? "default" : "secondary"}>{cc.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProfitCentersTab() {
  const { data: profitCenters = [], isLoading } = useQuery<ProfitCenter[]>({
    queryKey: ["/api/finance/profit-centers"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profit Centers</CardTitle>
        <Button data-testid="btn-add-profit-center"><Plus className="h-4 w-4 mr-2" /> Add Profit Center</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : profitCenters.map((pc) => (
              <TableRow key={pc.id} data-testid={`row-pc-${pc.id}`}>
                <TableCell className="font-mono">{pc.code}</TableCell>
                <TableCell className="font-medium">{pc.name}</TableCell>
                <TableCell><Badge variant="outline">{pc.type}</Badge></TableCell>
                <TableCell><Badge variant={pc.isActive ? "default" : "secondary"}>{pc.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TaxCodesTab() {
  const { data: taxCodes = [], isLoading } = useQuery<TaxCode[]>({
    queryKey: ["/api/finance/tax-codes"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tax Codes</CardTitle>
        <Button data-testid="btn-add-tax-code"><Plus className="h-4 w-4 mr-2" /> Add Tax Code</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : taxCodes.map((tc) => (
              <TableRow key={tc.id} data-testid={`row-tax-${tc.id}`}>
                <TableCell className="font-mono">{tc.code}</TableCell>
                <TableCell className="font-medium">{tc.name}</TableCell>
                <TableCell>{tc.rate}%</TableCell>
                <TableCell><Badge variant="outline">{tc.taxType}</Badge></TableCell>
                <TableCell><Badge variant={tc.isActive ? "default" : "secondary"}>{tc.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaymentTermsTab() {
  const { data: paymentTerms = [], isLoading } = useQuery<PaymentTerms[]>({
    queryKey: ["/api/finance/payment-terms"],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Terms</CardTitle>
        <Button data-testid="btn-add-payment-terms"><Plus className="h-4 w-4 mr-2" /> Add Payment Terms</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Due Days</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : paymentTerms.map((pt) => (
              <TableRow key={pt.id} data-testid={`row-pt-${pt.id}`}>
                <TableCell className="font-mono">{pt.code}</TableCell>
                <TableCell className="font-medium">{pt.name}</TableCell>
                <TableCell>{pt.dueDays} days</TableCell>
                <TableCell>{pt.discountPercent ? `${pt.discountPercent}% if paid in ${pt.discountDays} days` : "-"}</TableCell>
                <TableCell><Badge variant={pt.isActive ? "default" : "secondary"}>{pt.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FiscalCalendarTab() {
  const { data: fiscalYears = [], isLoading: yearsLoading } = useQuery<FiscalYear[]>({
    queryKey: ["/api/finance/fiscal-years"],
  });

  const activeYear = fiscalYears.find(fy => fy.status === "active");

  const { data: periods = [], isLoading: periodsLoading } = useQuery<FiscalPeriod[]>({
    queryKey: ["/api/finance/fiscal-periods/year", activeYear?.id],
    enabled: !!activeYear,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fiscal Years</CardTitle>
          <Button data-testid="btn-add-fiscal-year"><Plus className="h-4 w-4 mr-2" /> Add Fiscal Year</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearsLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : fiscalYears.map((fy) => (
                <TableRow key={fy.id} data-testid={`row-fy-${fy.id}`}>
                  <TableCell className="font-medium">{fy.name}</TableCell>
                  <TableCell>{new Date(fy.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(fy.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={fy.status === "active" ? "default" : fy.status === "closed" ? "secondary" : "outline"}>
                      {fy.status === "active" ? "Active" : fy.status === "closed" ? "Closed" : fy.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {activeYear && (
        <Card>
          <CardHeader>
            <CardTitle>Fiscal Periods - {activeYear.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {periodsLoading ? (
                <div className="col-span-4 text-center py-8">Loading periods...</div>
              ) : periods.map((period) => (
                <Card key={period.id} className={`${period.status === "open" ? "border-blue-500 border-2" : period.status === "closed" ? "bg-gray-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs">P{period.periodNumber}</span>
                      <Badge variant={period.status === "open" ? "default" : period.status === "closed" ? "secondary" : "outline"} className="text-xs">
                        {period.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{period.periodName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
