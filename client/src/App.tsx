import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import QCSetupEnhancedPage from "@/pages/qc-setup-enhanced";
import SopManagement from "@/pages/sop-management";
import QualityMetrics from "@/pages/quality-metrics";
import ProductionOrders from "@/pages/production-orders";
import BomManagement from "@/pages/bom-management";
import InventoryOverview from "@/pages/inventory-overview";
import StockMovements from "@/pages/stock-movements";
import QACheckpoints from "@/pages/qa-checkpoints";
import QAAssignmentTracker from "@/pages/qa-assignment-tracker";
import QABatchRelease from "@/pages/qa-batch-release";
import StabilityTesting from "@/pages/stability-testing";
import TerminalTesting from "@/pages/terminal-testing";
import QAAuditTrail from "@/pages/qa-audit-trail";
import QACAPAManagement from "@/pages/qa-capa";
import QARiskManagement from "@/pages/qa-risk-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/production-orders" component={ProductionOrders} />
      <Route path="/inventory-overview" component={InventoryOverview} />
      <Route path="/stock-movements" component={StockMovements} />
      <Route path="/qa-checkpoints" component={QACheckpoints} />
      <Route path="/qa-assignment-tracker" component={QAAssignmentTracker} />
      <Route path="/qa-batch-release" component={QABatchRelease} />
      <Route path="/stability-testing" component={StabilityTesting} />
      <Route path="/terminal-testing" component={TerminalTesting} />
      <Route path="/qa-audit-trail" component={QAAuditTrail} />
      <Route path="/qa-capa" component={QACAPAManagement} />
      <Route path="/qa-risk-management" component={QARiskManagement} />
      <Route path="/qc-setup" component={QCSetupEnhancedPage} />
      <Route path="/sop-management" component={SopManagement} />
      <Route path="/bom-management" component={BomManagement} />
      <Route path="/quality-metrics" component={QualityMetrics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
