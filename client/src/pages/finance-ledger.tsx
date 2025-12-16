import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, BookOpen, FileText, BarChart3, Lock, Unlock, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { GlJournal, FiscalPeriod, FiscalYear, ChartOfAccounts } from "@shared/schema";

export default function FinanceLedger() {
  const [activeTab, setActiveTab] = useState("journals");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">General Ledger & Reporting</h2>
              <p className="text-gray-600 text-sm mt-1">GL journals, trial balance, financial statements, and period close</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export Reports</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="journals" data-testid="tab-journals">
                <BookOpen className="h-4 w-4 mr-2" /> GL Journals
              </TabsTrigger>
              <TabsTrigger value="trial-balance" data-testid="tab-trial-balance">
                <BarChart3 className="h-4 w-4 mr-2" /> Trial Balance
              </TabsTrigger>
              <TabsTrigger value="statements" data-testid="tab-statements">
                <FileText className="h-4 w-4 mr-2" /> Financial Statements
              </TabsTrigger>
              <TabsTrigger value="period-close" data-testid="tab-period-close">
                <Lock className="h-4 w-4 mr-2" /> Period Close
              </TabsTrigger>
            </TabsList>

            <TabsContent value="journals">
              <GlJournalsTab />
            </TabsContent>
            <TabsContent value="trial-balance">
              <TrialBalanceTab />
            </TabsContent>
            <TabsContent value="statements">
              <FinancialStatementsTab />
            </TabsContent>
            <TabsContent value="period-close">
              <PeriodCloseTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function GlJournalsTab() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: journals = [], isLoading } = useQuery<GlJournal[]>({
    queryKey: ["/api/finance/gl-journals"],
  });

  const { data: accounts = [] } = useQuery<ChartOfAccounts[]>({
    queryKey: ["/api/finance/chart-of-accounts"],
  });

  const [formData, setFormData] = useState({
    journalNumber: `JE-${Date.now()}`,
    journalDate: new Date().toISOString().split('T')[0],
    description: "",
    journalType: "general",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/finance/gl-journals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/gl-journals"] });
      setIsOpen(false);
      toast({ title: "Journal entry created successfully" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>General Ledger Journals</CardTitle>
          <CardDescription>View and create journal entries</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-journal"><Plus className="h-4 w-4 mr-2" /> New Journal Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Journal Entry</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Journal Number</Label>
                  <Input value={formData.journalNumber} onChange={(e) => setFormData({ ...formData, journalNumber: e.target.value })} data-testid="input-journal-number" />
                </div>
                <div className="space-y-2">
                  <Label>Journal Date</Label>
                  <Input type="date" value={formData.journalDate} onChange={(e) => setFormData({ ...formData, journalDate: e.target.value })} data-testid="input-journal-date" />
                </div>
                <div className="space-y-2">
                  <Label>Journal Type</Label>
                  <Select value={formData.journalType} onValueChange={(v) => setFormData({ ...formData, journalType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="adjusting">Adjusting</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                      <SelectItem value="reversing">Reversing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Journal entry description" data-testid="input-journal-desc" />
              </div>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Journal Lines</Label>
                  <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Line</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Select>
                          <SelectTrigger className="w-48"><SelectValue placeholder="Select account" /></SelectTrigger>
                          <SelectContent>
                            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input placeholder="Line description" /></TableCell>
                      <TableCell><Input type="number" placeholder="0.00" className="text-right" /></TableCell>
                      <TableCell><Input type="number" placeholder="0.00" className="text-right" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="flex justify-end gap-8 pt-2 border-t">
                  <div className="text-sm"><span className="text-gray-500">Total Debit:</span> <span className="font-mono font-bold">₹0.00</span></div>
                  <div className="text-sm"><span className="text-gray-500">Total Credit:</span> <span className="font-mono font-bold">₹0.00</span></div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="btn-save-journal">
                  {createMutation.isPending ? "Creating..." : "Create & Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Journal #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading journals...</TableCell></TableRow>
            ) : journals.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No journal entries found. Create your first journal entry.</TableCell></TableRow>
            ) : journals.map((journal) => (
              <TableRow key={journal.id} data-testid={`row-journal-${journal.id}`}>
                <TableCell className="font-mono text-sm">{journal.journalNumber}</TableCell>
                <TableCell>{new Date(journal.journalDate).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant="outline">{journal.journalType}</Badge></TableCell>
                <TableCell>{journal.description || "-"}</TableCell>
                <TableCell className="text-right font-mono">₹{parseFloat(journal.totalDebit || "0").toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">₹{parseFloat(journal.totalCredit || "0").toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={journal.status === "posted" ? "default" : journal.status === "draft" ? "secondary" : "destructive"}>
                    {journal.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TrialBalanceTab() {
  const { data: fiscalYears = [] } = useQuery<FiscalYear[]>({
    queryKey: ["/api/finance/fiscal-years"],
  });

  const activeYear = fiscalYears.find(fy => fy.status === "active");

  const { data: periods = [] } = useQuery<FiscalPeriod[]>({
    queryKey: ["/api/finance/fiscal-periods/year", activeYear?.id],
    enabled: !!activeYear,
  });

  const openPeriod = periods.find(p => p.status === "open");

  const { data: accounts = [] } = useQuery<ChartOfAccounts[]>({
    queryKey: ["/api/finance/chart-of-accounts"],
  });

  const mockTrialBalance = accounts.map(account => ({
    ...account,
    debit: account.normalBalance === "debit" ? Math.random() * 500000 : 0,
    credit: account.normalBalance === "credit" ? Math.random() * 500000 : 0,
  }));

  const totalDebit = mockTrialBalance.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = mockTrialBalance.reduce((sum, a) => sum + a.credit, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>
            Period: {openPeriod?.periodName || "Select period"} | As of: {new Date().toLocaleDateString()}
          </CardDescription>
        </div>
        <Select defaultValue={openPeriod?.id || ""}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Select period" /></SelectTrigger>
          <SelectContent>
            {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.periodName}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Debit (₹)</TableHead>
              <TableHead className="text-right">Credit (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrialBalance.filter(a => a.debit > 0 || a.credit > 0).map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono">{account.accountCode}</TableCell>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell><Badge variant="outline">{account.accountType}</Badge></TableCell>
                <TableCell className="text-right font-mono">{account.debit > 0 ? account.debit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "-"}</TableCell>
                <TableCell className="text-right font-mono">{account.credit > 0 ? account.credit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "-"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-bold">
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right font-mono">₹{totalDebit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
              <TableCell className="text-right font-mono">₹{totalCredit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-center">
          {Math.abs(totalDebit - totalCredit) < 1 ? (
            <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-4 w-4 mr-1" /> Trial Balance is Balanced</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800"><XCircle className="h-4 w-4 mr-1" /> Out of Balance by ₹{Math.abs(totalDebit - totalCredit).toLocaleString()}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialStatementsTab() {
  const [statementType, setStatementType] = useState("income");

  const mockIncomeStatement = {
    revenue: [
      { account: "Sales Revenue", amount: 4850000 },
      { account: "Service Revenue", amount: 250000 },
    ],
    cogs: [
      { account: "Direct Materials", amount: 1850000 },
      { account: "Direct Labor", amount: 520000 },
      { account: "Manufacturing Overhead", amount: 320000 },
    ],
    expenses: [
      { account: "Salaries & Wages", amount: 680000 },
      { account: "Rent Expense", amount: 180000 },
      { account: "Utilities", amount: 75000 },
      { account: "Depreciation", amount: 120000 },
      { account: "Other Expenses", amount: 85000 },
    ],
  };

  const totalRevenue = mockIncomeStatement.revenue.reduce((s, r) => s + r.amount, 0);
  const totalCogs = mockIncomeStatement.cogs.reduce((s, r) => s + r.amount, 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalExpenses = mockIncomeStatement.expenses.reduce((s, r) => s + r.amount, 0);
  const netIncome = grossProfit - totalExpenses;

  const mockBalanceSheet = {
    assets: {
      current: [
        { account: "Cash", amount: 850000 },
        { account: "Accounts Receivable", amount: 1250000 },
        { account: "Inventory", amount: 2150000 },
        { account: "Prepaid Expenses", amount: 75000 },
      ],
      fixed: [
        { account: "Equipment", amount: 3500000 },
        { account: "Accumulated Depreciation", amount: -850000 },
        { account: "Buildings", amount: 5000000 },
      ],
    },
    liabilities: {
      current: [
        { account: "Accounts Payable", amount: 680000 },
        { account: "Accrued Expenses", amount: 120000 },
        { account: "Short-term Loans", amount: 500000 },
      ],
      longTerm: [
        { account: "Long-term Debt", amount: 2500000 },
      ],
    },
    equity: [
      { account: "Owner's Equity", amount: 5000000 },
      { account: "Retained Earnings", amount: 3175000 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={statementType === "income" ? "default" : "outline"} onClick={() => setStatementType("income")}>Income Statement</Button>
        <Button variant={statementType === "balance" ? "default" : "outline"} onClick={() => setStatementType("balance")}>Balance Sheet</Button>
        <Button variant={statementType === "cashflow" ? "default" : "outline"} onClick={() => setStatementType("cashflow")}>Cash Flow</Button>
      </div>

      {statementType === "income" && (
        <Card>
          <CardHeader>
            <CardTitle>Income Statement</CardTitle>
            <CardDescription>For the period ending {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-green-700">Revenue</h4>
              <Table>
                <TableBody>
                  {mockIncomeStatement.revenue.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-8">{item.account}</TableCell>
                      <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-green-50">
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right font-mono">₹{totalRevenue.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2 text-orange-700">Cost of Goods Sold</h4>
              <Table>
                <TableBody>
                  {mockIncomeStatement.cogs.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-8">{item.account}</TableCell>
                      <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-orange-50">
                    <TableCell>Total COGS</TableCell>
                    <TableCell className="text-right font-mono">₹{totalCogs.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
              <span className="font-bold text-lg">Gross Profit</span>
              <span className="font-mono font-bold text-xl text-blue-700">₹{grossProfit.toLocaleString()}</span>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2 text-red-700">Operating Expenses</h4>
              <Table>
                <TableBody>
                  {mockIncomeStatement.expenses.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-8">{item.account}</TableCell>
                      <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-red-50">
                    <TableCell>Total Operating Expenses</TableCell>
                    <TableCell className="text-right font-mono">₹{totalExpenses.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className={`p-4 rounded-lg flex justify-between items-center ${netIncome >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              <span className="font-bold text-xl">Net Income</span>
              <span className={`font-mono font-bold text-2xl ${netIncome >= 0 ? "text-green-700" : "text-red-700"}`}>
                ₹{netIncome.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {statementType === "balance" && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
            <CardDescription>As of {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-blue-700">Assets</h4>
                  <h5 className="font-medium text-sm text-gray-500 mb-1">Current Assets</h5>
                  <Table>
                    <TableBody>
                      {mockBalanceSheet.assets.current.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4">{item.account}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <h5 className="font-medium text-sm text-gray-500 mb-1 mt-4">Fixed Assets</h5>
                  <Table>
                    <TableBody>
                      {mockBalanceSheet.assets.fixed.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4">{item.account}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="bg-blue-50 p-3 rounded mt-2 flex justify-between">
                    <span className="font-bold">Total Assets</span>
                    <span className="font-mono font-bold">₹{(mockBalanceSheet.assets.current.reduce((s, a) => s + a.amount, 0) + mockBalanceSheet.assets.fixed.reduce((s, a) => s + a.amount, 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-red-700">Liabilities</h4>
                  <h5 className="font-medium text-sm text-gray-500 mb-1">Current Liabilities</h5>
                  <Table>
                    <TableBody>
                      {mockBalanceSheet.liabilities.current.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4">{item.account}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <h5 className="font-medium text-sm text-gray-500 mb-1 mt-4">Long-term Liabilities</h5>
                  <Table>
                    <TableBody>
                      {mockBalanceSheet.liabilities.longTerm.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4">{item.account}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-purple-700">Equity</h4>
                  <Table>
                    <TableBody>
                      {mockBalanceSheet.equity.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4">{item.account}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="bg-purple-50 p-3 rounded mt-2 flex justify-between">
                    <span className="font-bold">Total Liabilities + Equity</span>
                    <span className="font-mono font-bold">₹{(mockBalanceSheet.liabilities.current.reduce((s, a) => s + a.amount, 0) + mockBalanceSheet.liabilities.longTerm.reduce((s, a) => s + a.amount, 0) + mockBalanceSheet.equity.reduce((s, a) => s + a.amount, 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {statementType === "cashflow" && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Statement</CardTitle>
            <CardDescription>For the period ending {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Cash flow statement generation requires additional transaction data.</p>
            <p className="text-sm mt-2">Coming soon in the next release.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PeriodCloseTab() {
  const { toast } = useToast();

  const { data: fiscalYears = [] } = useQuery<FiscalYear[]>({
    queryKey: ["/api/finance/fiscal-years"],
  });

  const activeYear = fiscalYears.find(fy => fy.status === "active");

  const { data: periods = [] } = useQuery<FiscalPeriod[]>({
    queryKey: ["/api/finance/fiscal-periods/year", activeYear?.id],
    enabled: !!activeYear,
  });

  const closeChecklist = [
    { id: 1, task: "All invoices posted", status: "complete" },
    { id: 2, task: "All payments recorded", status: "complete" },
    { id: 3, task: "Bank reconciliation completed", status: "pending" },
    { id: 4, task: "Inventory adjustments posted", status: "complete" },
    { id: 5, task: "Depreciation entries posted", status: "pending" },
    { id: 6, task: "Accruals and deferrals adjusted", status: "pending" },
    { id: 7, task: "Trial balance reviewed", status: "pending" },
    { id: 8, task: "Intercompany transactions cleared", status: "complete" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Period Close Checklist</CardTitle>
          <CardDescription>Complete all tasks before closing the period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {closeChecklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {item.status === "complete" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={item.status === "complete" ? "text-gray-500" : "font-medium"}>{item.task}</span>
                </div>
                <Badge variant={item.status === "complete" ? "default" : "outline"}>
                  {item.status === "complete" ? "Complete" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <Button variant="outline" className="flex-1"><Unlock className="h-4 w-4 mr-2" /> Reopen Previous Period</Button>
            <Button className="flex-1" disabled={closeChecklist.some(c => c.status === "pending")}>
              <Lock className="h-4 w-4 mr-2" /> Close Current Period
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiscal Periods Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {periods.map((period) => (
              <div key={period.id} className={`p-3 rounded-lg border text-center ${period.status === "open" ? "bg-blue-50 border-blue-300" : period.status === "closed" ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"}`}>
                <p className="text-xs text-gray-500">P{period.periodNumber}</p>
                <p className="font-medium text-sm truncate">{period.periodName.split(" ")[0]}</p>
                {period.status === "open" ? (
                  <Unlock className="h-4 w-4 mx-auto mt-1 text-blue-500" />
                ) : period.status === "closed" ? (
                  <Lock className="h-4 w-4 mx-auto mt-1 text-gray-400" />
                ) : (
                  <div className="h-4 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
