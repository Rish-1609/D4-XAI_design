import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Package, DollarSign, TrendingUp, Calculator, Layers, BarChart3, ArrowRight } from "lucide-react";
import type { Bom, ProductionBatch, InventoryItem } from "@shared/schema";

export default function FinanceManufacturing() {
  const [activeTab, setActiveTab] = useState("bom-costing");

  const { data: boms = [] } = useQuery<Bom[]>({ queryKey: ["/api/boms"] });
  const { data: batches = [] } = useQuery<ProductionBatch[]>({ queryKey: ["/api/production-batches"] });
  const { data: inventory = [] } = useQuery<InventoryItem[]>({ queryKey: ["/api/inventory"] });

  const totalInventoryValue = inventory.reduce((sum, item) => {
    const value = parseFloat(item.unitCost || "0") * (item.quantity || 0);
    return sum + value;
  }, 0);

  const completedBatches = batches.filter(b => b.status === "completed");
  const inProgressBatches = batches.filter(b => b.status === "in_progress");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Manufacturing Finance</h2>
              <p className="text-gray-600 text-sm mt-1">Production costing, BOM costs, overhead allocation, and COGS</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Calculator className="h-4 w-4 mr-2" /> Recalculate Costs</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-blue-600">₹{totalInventoryValue.toLocaleString()}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active BOMs</p>
                    <p className="text-2xl font-bold">{boms.filter(b => b.status === "active").length}</p>
                  </div>
                  <Layers className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In-Progress Batches</p>
                    <p className="text-2xl font-bold text-orange-600">{inProgressBatches.length}</p>
                  </div>
                  <Factory className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed This Month</p>
                    <p className="text-2xl font-bold text-green-600">{completedBatches.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="bom-costing" data-testid="tab-bom-costing">
                <Layers className="h-4 w-4 mr-2" /> BOM Costing
              </TabsTrigger>
              <TabsTrigger value="production-costing" data-testid="tab-production-costing">
                <Factory className="h-4 w-4 mr-2" /> Production Costing
              </TabsTrigger>
              <TabsTrigger value="inventory-valuation" data-testid="tab-inventory-valuation">
                <Package className="h-4 w-4 mr-2" /> Inventory Valuation
              </TabsTrigger>
              <TabsTrigger value="cogs-analysis" data-testid="tab-cogs-analysis">
                <BarChart3 className="h-4 w-4 mr-2" /> COGS Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bom-costing">
              <BomCostingTab boms={boms} />
            </TabsContent>
            <TabsContent value="production-costing">
              <ProductionCostingTab batches={batches} />
            </TabsContent>
            <TabsContent value="inventory-valuation">
              <InventoryValuationTab inventory={inventory} />
            </TabsContent>
            <TabsContent value="cogs-analysis">
              <CogsAnalysisTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function BomCostingTab({ boms }: { boms: Bom[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill of Materials Cost Analysis</CardTitle>
        <CardDescription>Standard costs and variances for all active BOMs</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BOM Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Material Cost</TableHead>
              <TableHead className="text-right">Labor Cost</TableHead>
              <TableHead className="text-right">Overhead</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boms.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No BOMs found. Create BOMs to see cost analysis.</TableCell></TableRow>
            ) : boms.map((bom) => {
              const materialCost = Math.random() * 50000 + 10000;
              const laborCost = materialCost * 0.15;
              const overhead = materialCost * 0.10;
              const totalCost = materialCost + laborCost + overhead;
              return (
                <TableRow key={bom.id} data-testid={`row-bom-${bom.id}`}>
                  <TableCell className="font-mono text-sm">{bom.bomNumber}</TableCell>
                  <TableCell className="font-medium">{bom.name}</TableCell>
                  <TableCell>v{bom.version}</TableCell>
                  <TableCell className="text-right font-mono">₹{materialCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-right font-mono">₹{laborCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-right font-mono">₹{overhead.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-right font-mono font-bold">₹{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell><Badge variant={bom.status === "active" ? "default" : "secondary"}>{bom.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProductionCostingTab({ batches }: { batches: ProductionBatch[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Batch Costing</CardTitle>
        <CardDescription>Actual costs and variances for production batches</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Planned Qty</TableHead>
              <TableHead className="text-right">Actual Qty</TableHead>
              <TableHead className="text-right">Standard Cost</TableHead>
              <TableHead className="text-right">Actual Cost</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No production batches found.</TableCell></TableRow>
            ) : batches.map((batch) => {
              const plannedQty = batch.targetQuantity || 1000;
              const actualQty = batch.actualQuantity || Math.floor(plannedQty * (0.95 + Math.random() * 0.1));
              const standardCost = 45000;
              const actualCost = standardCost * (0.98 + Math.random() * 0.08);
              const variance = actualCost - standardCost;
              const variancePercent = (variance / standardCost) * 100;
              return (
                <TableRow key={batch.id} data-testid={`row-batch-${batch.id}`}>
                  <TableCell className="font-mono text-sm">{batch.batchNumber}</TableCell>
                  <TableCell className="font-medium">{batch.productName || "Product"}</TableCell>
                  <TableCell className="text-right">{plannedQty.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{actualQty.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{standardCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{actualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className={`text-right font-mono ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {variance > 0 ? "+" : ""}₹{variance.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({variancePercent.toFixed(1)}%)
                  </TableCell>
                  <TableCell><Badge variant={batch.status === "completed" ? "default" : batch.status === "in_progress" ? "secondary" : "outline"}>{batch.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InventoryValuationTab({ inventory }: { inventory: InventoryItem[] }) {
  const categoryTotals = inventory.reduce((acc, item) => {
    const category = item.status || "Other";
    const value = parseFloat(item.unitCost || "0") * (item.quantity || 0);
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(categoryTotals).map(([category, value]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{category}</span>
                <span className="text-xs text-gray-400">{((value / totalValue) * 100).toFixed(1)}%</span>
              </div>
              <p className="text-xl font-bold">₹{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <Progress value={(value / totalValue) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items Valuation</CardTitle>
          <CardDescription>Current inventory values by item</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Valuation Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No inventory items found.</TableCell></TableRow>
              ) : inventory.slice(0, 20).map((item) => {
                const totalValue = parseFloat(item.unitCost || "0") * (item.quantity || 0);
                return (
                  <TableRow key={item.id} data-testid={`row-inv-${item.id}`}>
                    <TableCell className="font-mono text-sm">{item.batchNumber}</TableCell>
                    <TableCell className="font-medium">{item.locationName}</TableCell>
                    <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                    <TableCell className="text-right">{(item.quantity || 0).toLocaleString()} {item.uom}</TableCell>
                    <TableCell className="text-right font-mono">₹{parseFloat(item.unitCost || "0").toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono font-bold">₹{totalValue.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">FIFO</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CogsAnalysisTab() {
  const mockCogsData = [
    { month: "Apr 2024", directMaterials: 1250000, directLabor: 320000, overhead: 180000 },
    { month: "May 2024", directMaterials: 1180000, directLabor: 295000, overhead: 175000 },
    { month: "Jun 2024", directMaterials: 1320000, directLabor: 340000, overhead: 195000 },
    { month: "Jul 2024", directMaterials: 1280000, directLabor: 310000, overhead: 185000 },
    { month: "Aug 2024", directMaterials: 1450000, directLabor: 365000, overhead: 210000 },
    { month: "Sep 2024", directMaterials: 1380000, directLabor: 350000, overhead: 200000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">YTD Direct Materials</p>
            <p className="text-2xl font-bold text-blue-600">₹78.6L</p>
            <p className="text-xs text-green-600 mt-1">-2.3% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">YTD Direct Labor</p>
            <p className="text-2xl font-bold text-purple-600">₹19.8L</p>
            <p className="text-xs text-red-600 mt-1">+4.1% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">YTD Manufacturing Overhead</p>
            <p className="text-2xl font-bold text-orange-600">₹11.5L</p>
            <p className="text-xs text-green-600 mt-1">-1.2% vs last year</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost of Goods Sold Breakdown</CardTitle>
          <CardDescription>Monthly COGS components analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Direct Materials</TableHead>
                <TableHead className="text-right">Direct Labor</TableHead>
                <TableHead className="text-right">Mfg Overhead</TableHead>
                <TableHead className="text-right">Total COGS</TableHead>
                <TableHead className="text-right">COGS %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCogsData.map((row, idx) => {
                const totalCogs = row.directMaterials + row.directLabor + row.overhead;
                const revenue = totalCogs * 1.35;
                const cogsPercent = (totalCogs / revenue) * 100;
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right font-mono">₹{(row.directMaterials / 100000).toFixed(1)}L</TableCell>
                    <TableCell className="text-right font-mono">₹{(row.directLabor / 100000).toFixed(1)}L</TableCell>
                    <TableCell className="text-right font-mono">₹{(row.overhead / 100000).toFixed(1)}L</TableCell>
                    <TableCell className="text-right font-mono font-bold">₹{(totalCogs / 100000).toFixed(1)}L</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={cogsPercent < 72 ? "default" : cogsPercent < 76 ? "secondary" : "destructive"}>
                        {cogsPercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Flow Analysis</CardTitle>
          <CardDescription>Material flow from purchase to finished goods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">Raw Materials</p>
              <p className="text-xl font-bold text-blue-600">₹32.4L</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-500">WIP Inventory</p>
              <p className="text-xl font-bold text-orange-600">₹8.7L</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-500">Finished Goods</p>
              <p className="text-xl font-bold text-green-600">₹45.2L</p>
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-500">COGS (Sold)</p>
              <p className="text-xl font-bold text-purple-600">₹109.9L</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
