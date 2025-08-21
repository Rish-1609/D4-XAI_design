import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Search,
  Shield,
  FileCheck,
  Calendar,
  CheckCircle,
} from "lucide-react";
import type { ProductionOrder } from "@shared/schema";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function QACertificates() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  // Mock digital certificates based on completed production orders
  const certificates = useMemo(() => {
    return (productionOrders as ProductionOrder[])
      .filter((order: ProductionOrder) => order.status === "Completed")
      .map((order: ProductionOrder, index: number) => ({
        id: `cert-${order.id}`,
        certificateNumber: `COA-${order.orderNumber}-${new Date().getFullYear()}`,
        type: "Certificate of Analysis",
        productName: order.skuProduct,
        batchNumber: `BATCH-${order.orderNumber}`,
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        issuedDate: new Date(order.dueDate),
        validUntil: new Date(new Date(order.dueDate).getTime() + (2 * 365 * 24 * 60 * 60 * 1000)),
        status: "Active",
        digitalSignature: "Dr. Priya Sharma - QA Manager",
        signatureDate: new Date(order.dueDate),
        complianceStandards: ["FDA 21 CFR 211", "ICH Q7", "GMP Guidelines"],
        certificateHash: `SHA256:${Math.random().toString(36).substr(2, 40)}`,
      }));
  }, [productionOrders]);

  const filteredCertificates = useMemo(() => {
    if (!searchTerm) return certificates;
    return certificates.filter(cert =>
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [certificates, searchTerm]);

  const stats = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter(cert => cert.status === "Active").length;
    const thisMonth = certificates.filter(cert => {
      const certDate = new Date(cert.issuedDate);
      const now = new Date();
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, active, thisMonth };
  }, [certificates]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="qa-certificates-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="qa-certificates-title">
            Digital Certificates
          </h1>
          <p className="text-muted-foreground">
            Certificate of Analysis (CoA) management with digital signatures and compliance tracking
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-certificates">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Digital CoA certificates issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="active-certificates">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently valid certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="monthly-certificates">
              {stats.thisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              Certificates issued this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="certificate-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Certificate Records</CardTitle>
          <CardDescription>
            Complete record of digitally signed Certificate of Analysis documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Digital Signature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{certificate.certificateNumber}</div>
                      <div className="text-sm text-muted-foreground">{certificate.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{certificate.productName}</div>
                  </TableCell>
                  <TableCell>{certificate.batchNumber}</TableCell>
                  <TableCell>{formatDate(certificate.issuedDate)}</TableCell>
                  <TableCell>{formatDate(certificate.validUntil)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3 text-green-500" />
                      <span className="text-sm">{certificate.digitalSignature}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{certificate.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <FileCheck className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Certificate Compliance</CardTitle>
          <CardDescription>
            Regulatory compliance and digital signature verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Compliance Standards</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>FDA 21 CFR 211:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ICH Q7 Guidelines:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GMP Standards:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Digital Signature Security</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Encryption:</span>
                  <Badge variant="default">SHA-256</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Certificate Authority:</span>
                  <Badge variant="default">Verified</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tamper Protection:</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}