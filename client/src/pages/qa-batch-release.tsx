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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FileCheck,
  Search,
  Eye,
  Download,
  Shield,
  Award,
} from "lucide-react";
import type { ProductionOrder } from "@shared/schema";

interface BatchRelease {
  id: string;
  batchNumber: string;
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  manufacturingDate: Date;
  expiryDate: Date;
  quantity: number;
  status: string;
  qaManager: string;
  releaseDate: Date | null;
  certificateNumber: string | null;
  testResults: Record<string, string>;
  releaseNotes: string;
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
    case "released":
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "under review":
    case "pending approval":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
    case "on hold":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "released":
    case "approved":
      return "default";
    case "under review":
    case "pending approval":
      return "secondary";
    case "rejected":
    case "on hold":
      return "destructive";
    default:
      return "outline";
  }
};

export default function QABatchRelease() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  // Mock batch release data based on production orders
  const batchReleases = useMemo(() => {
    return (productionOrders as ProductionOrder[]).map((order: ProductionOrder, index: number) => ({
      id: `br-${order.id}`,
      batchNumber: `BATCH-${order.orderNumber}`,
      productionOrderId: order.id,
      orderNumber: order.orderNumber,
      productName: order.skuProduct,
      manufacturingDate: order.createdAt || new Date(),
      expiryDate: new Date(new Date(order.createdAt || new Date()).getTime() + (2 * 365 * 24 * 60 * 60 * 1000)), // 2 years from manufacturing
      quantity: order.quantity,
      status: order.status === "Completed" 
        ? (index % 4 === 0 ? "Released" : "Under Review")
        : "Awaiting Production",
      qaManager: "Dr. Priya Sharma",
      releaseDate: order.status === "Completed" && index % 4 === 0 
        ? new Date(order.dueDate) 
        : null,
      certificateNumber: order.status === "Completed" && index % 4 === 0 
        ? `COA-${order.orderNumber}-${new Date().getFullYear()}`
        : null,
      testResults: {
        assay: index % 4 === 0 ? "98.5%" : "Pending",
        dissolution: index % 4 === 0 ? "Pass" : "Pending",
        uniformity: index % 4 === 0 ? "Pass" : "Pending",
        microbial: index % 4 === 0 ? "Pass" : "Pending",
        stability: index % 4 === 0 ? "Pass" : "Pending",
      },
      releaseNotes: index % 4 === 0 
        ? "All quality parameters meet specifications. Batch approved for commercial distribution."
        : "Awaiting final test results and documentation review.",
    }));
  }, [productionOrders]);

  // Filtering
  const filteredReleases = useMemo(() => {
    let filtered = batchReleases;

    if (searchTerm) {
      filtered = filtered.filter((release: BatchRelease) =>
        release.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus && selectedStatus !== "all-statuses") {
      filtered = filtered.filter((release: BatchRelease) => release.status === selectedStatus);
    }

    return filtered;
  }, [batchReleases, searchTerm, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = batchReleases.length;
    const released = batchReleases.filter((br: BatchRelease) => br.status === "Released").length;
    const underReview = batchReleases.filter((br: BatchRelease) => br.status === "Under Review").length;
    const awaiting = batchReleases.filter((br: BatchRelease) => br.status === "Awaiting Production").length;

    return {
      total,
      released,
      underReview,
      awaiting,
      releaseRate: total > 0 ? Math.round((released / total) * 100) : 0,
    };
  }, [batchReleases]);

  // Mutation for batch approval
  const approveBatchMutation = useMutation({
    mutationFn: ({ batchId }: { batchId: string }) =>
      // This would typically update a batch release record in the database
      Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
      toast({ title: "Batch approved and released for distribution!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve batch", variant: "destructive" });
    },
  });

  const handleBatchApproval = (batchId: string) => {
    approveBatchMutation.mutate({ batchId });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="batch-release-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="batch-release-title">
            Batch Release Management
          </h1>
          <p className="text-muted-foreground">
            Pharmaceutical batch release workflow with QA approval and certificate generation
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-batches">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all production orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Released</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="released-batches">
              {stats.released}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.releaseRate}% release rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="review-batches">
              {stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending QA approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Production</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="awaiting-batches">
              {stats.awaiting}
            </div>
            <p className="text-xs text-muted-foreground">
              Production in progress
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
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="batch-search"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Awaiting Production">Awaiting Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batch Release Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Release Records</CardTitle>
          <CardDescription>
            Comprehensive batch release management with QA approval workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>QA Manager</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReleases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{release.batchNumber}</div>
                      <div className="text-sm text-muted-foreground">{release.orderNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{release.productName}</div>
                  </TableCell>
                  <TableCell>{release.quantity.toLocaleString()} units</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(release.status)}
                      <Badge variant={getStatusVariant(release.status)}>
                        {release.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{release.qaManager}</TableCell>
                  <TableCell>
                    {release.releaseDate ? formatDate(release.releaseDate) : "N/A"}
                  </TableCell>
                  <TableCell>
                    {release.certificateNumber ? (
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 text-green-500" />
                        <span className="text-sm">{release.certificateNumber}</span>
                      </div>
                    ) : (
                      "Pending"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {release.status === "Under Review" && (
                        <Button
                          size="sm"
                          onClick={() => handleBatchApproval(release.id)}
                          data-testid={`button-approve-batch-${release.id}`}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                      {release.certificateNumber && (
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          CoA
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quality Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Summary</CardTitle>
          <CardDescription>
            Overview of quality parameters and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Critical Quality Attributes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Assay (%):</span>
                  <span className="text-green-600">95.0 - 105.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Dissolution:</span>
                  <span className="text-green-600">Q+15min ≥ 85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Uniformity:</span>
                  <span className="text-green-600">85.0 - 115.0%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Regulatory Compliance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>FDA Guidelines:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ICH Guidelines:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GMP Standards:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Documentation Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Batch Records:</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Test Results:</span>
                  <Badge variant="default">Reviewed</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Release Notes:</span>
                  <Badge variant="default">Approved</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}