import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Eye,
  CheckSquare,
} from "lucide-react";
import type { ProductionOrder, TestResult } from "@shared/schema";

interface QCCheckpoint {
  id: string;
  name: string;
  stage: string;
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  status: string;
  assignedTo: string;
  dueDate: Date;
  completedAt: Date | null;
  criteria: string[];
  results: Record<string, string>;
  notes: string;
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
    case "pass":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in progress":
    case "pending":
    case "under review":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
    case "fail":
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
    case "pass":
      return "default";
    case "in progress":
    case "pending":
    case "under review":
      return "secondary";
    case "rejected":
    case "fail":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

export default function QACheckpoints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: testResults = [] } = useQuery({
    queryKey: ["/api/test-results"],
  });

  // Mock QC checkpoints based on production orders and test results
  const qcCheckpoints = useMemo(() => {
    return (productionOrders as ProductionOrder[]).flatMap((order: ProductionOrder) => [
      {
        id: `cp-${order.id}-1`,
        name: "Raw Material Inspection",
        stage: "Pre-Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: "Completed",
        assignedTo: "QC Inspector A",
        dueDate: new Date(order.createdAt || new Date()),
        completedAt: new Date(order.createdAt || new Date()),
        criteria: ["Visual Inspection", "Identity Test", "Purity Check"],
        results: { visual: "Pass", identity: "Pass", purity: "Pass" },
        notes: "All raw materials meet specification requirements",
      },
      {
        id: `cp-${order.id}-2`,
        name: "In-Process Controls",
        stage: "Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: order.status === "Completed" ? "Completed" : "In Progress",
        assignedTo: "QC Inspector B",
        dueDate: new Date(order.dueDate),
        completedAt: order.status === "Completed" ? new Date(order.dueDate) : null,
        criteria: ["Blend Uniformity", "Tablet Weight", "Hardness", "Friability"],
        results: order.status === "Completed" 
          ? { blend: "Pass", weight: "Pass", hardness: "Pass", friability: "Pass" }
          : { blend: "Pending", weight: "Pending", hardness: "Pending", friability: "Pending" },
        notes: order.status === "Completed" ? "All in-process parameters within limits" : "Testing in progress",
      },
      {
        id: `cp-${order.id}-3`,
        name: "Final Product Testing",
        stage: "Post-Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: order.status === "Completed" ? "Completed" : "Pending",
        assignedTo: "QC Inspector C",
        dueDate: new Date(order.dueDate),
        completedAt: order.status === "Completed" ? new Date(order.dueDate) : null,
        criteria: ["Assay", "Dissolution", "Content Uniformity", "Microbial Limits"],
        results: order.status === "Completed" 
          ? { assay: "Pass", dissolution: "Pass", uniformity: "Pass", microbial: "Pass" }
          : { assay: "Pending", dissolution: "Pending", uniformity: "Pending", microbial: "Pending" },
        notes: order.status === "Completed" ? "Product meets all quality specifications" : "Awaiting production completion",
      },
    ]);
  }, [productionOrders]);

  // Filtering
  const filteredCheckpoints = useMemo(() => {
    let filtered = qcCheckpoints;

    if (searchTerm) {
      filtered = filtered.filter((cp: QCCheckpoint) =>
        cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedOrder && selectedOrder !== "all-orders") {
      filtered = filtered.filter((cp: QCCheckpoint) => cp.productionOrderId === selectedOrder);
    }

    if (selectedStage && selectedStage !== "all-stages") {
      filtered = filtered.filter((cp: QCCheckpoint) => cp.stage === selectedStage);
    }

    return filtered;
  }, [qcCheckpoints, searchTerm, selectedOrder, selectedStage]);

  // Statistics
  const stats = useMemo(() => {
    const total = qcCheckpoints.length;
    const completed = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "Completed").length;
    const inProgress = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "In Progress").length;
    const pending = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "Pending").length;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [qcCheckpoints]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="qc-checkpoints-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="qc-checkpoints-title">
            QC Checkpoints
          </h1>
          <p className="text-muted-foreground">
            Stage-wise quality control checkpoints with real-time monitoring and approval workflows
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checkpoints</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-checkpoints">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all production orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="completed-checkpoints">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="inprogress-checkpoints">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="pending-checkpoints">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search checkpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="checkpoint-search"
              />
            </div>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by production order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-orders">All Orders</SelectItem>
                {(productionOrders as ProductionOrder[]).map((order: ProductionOrder) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.orderNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stages">All Stages</SelectItem>
                <SelectItem value="Pre-Production">Pre-Production</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Post-Production">Post-Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>QC Checkpoints</CardTitle>
          <CardDescription>
            Stage-wise quality control checkpoints with detailed criteria and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Checkpoint</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Production Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckpoints.map((checkpoint) => (
                <TableRow key={checkpoint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{checkpoint.name}</div>
                      <div className="text-sm text-muted-foreground">{checkpoint.productName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{checkpoint.stage}</Badge>
                  </TableCell>
                  <TableCell>{checkpoint.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(checkpoint.status)}
                      <Badge variant={getStatusVariant(checkpoint.status)}>
                        {checkpoint.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{checkpoint.assignedTo}</TableCell>
                  <TableCell>{formatDate(checkpoint.dueDate)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}