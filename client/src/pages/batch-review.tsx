import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Search,
  Loader2,
  ArrowRight,
  Package,
  Factory,
} from "lucide-react";
import type { ProductionBatch, BatchReview } from "@shared/schema";

const formatDate = (date: Date | string | null) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function BatchReviewClosure() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: batches = [], isLoading } = useQuery<ProductionBatch[]>({
    queryKey: ["/api/production-batches"],
  });

  const { data: reviews = [] } = useQuery<BatchReview[]>({
    queryKey: ["/api/batch-reviews"],
  });

  // Batches ready for review (completed or QC hold)
  const reviewableBatches = batches.filter(b => 
    b.status === "completed" || b.status === "qc-hold"
  );

  const filteredBatches = reviewableBatches.filter(batch =>
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const selectedReview = reviews.find(r => r.batchId === selectedBatchId);

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/batch-reviews", {
        batchId: selectedBatchId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/production-batches"] });
      setReviewDialogOpen(false);
      toast({ title: "Success", description: "Batch review submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("PATCH", `/api/batch-reviews/${reviewId}`, {
        reviewStatus: "approved",
        approvedBy: "Current User",
        approvedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-reviews"] });
      toast({ title: "Approved", description: "Batch has been approved for QA handoff" });
    },
  });

  const ReviewChecklist = ({ batch }: { batch: ProductionBatch }) => {
    const [checks, setChecks] = useState({
      allStagesCompleted: false,
      yieldRecorded: !!batch.yieldPercentage,
      deviationsLogged: true,
      materialBalanceOk: true,
    });
    const [closureNotes, setClosureNotes] = useState("");

    const allChecked = Object.values(checks).every(Boolean);

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Batch Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Batch Number</p>
              <p className="font-medium">{batch.batchNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Product</p>
              <p className="font-medium">{batch.productName}</p>
            </div>
            <div>
              <p className="text-gray-500">Target Quantity</p>
              <p className="font-medium">{batch.targetQuantity?.toLocaleString()} {batch.uom}</p>
            </div>
            <div>
              <p className="text-gray-500">Actual Quantity</p>
              <p className="font-medium">{batch.actualQuantity?.toLocaleString() || "Not recorded"} {batch.uom}</p>
            </div>
            <div>
              <p className="text-gray-500">Yield</p>
              <p className="font-medium">{batch.yieldPercentage ? `${batch.yieldPercentage}%` : "Not recorded"}</p>
            </div>
            <div>
              <p className="text-gray-500">Scrap</p>
              <p className="font-medium">{batch.scrapQuantity?.toLocaleString() || "0"} {batch.uom}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Pre-Closure Checklist</h3>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="stages"
              checked={checks.allStagesCompleted}
              onCheckedChange={(checked) => setChecks(prev => ({ ...prev, allStagesCompleted: !!checked }))}
              data-testid="check-stages"
            />
            <label htmlFor="stages" className="flex-1 cursor-pointer">
              <p className="font-medium">All stages completed</p>
              <p className="text-sm text-gray-500">Verify all production stages are marked complete</p>
            </label>
            {checks.allStagesCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="yield"
              checked={checks.yieldRecorded}
              onCheckedChange={(checked) => setChecks(prev => ({ ...prev, yieldRecorded: !!checked }))}
              data-testid="check-yield"
            />
            <label htmlFor="yield" className="flex-1 cursor-pointer">
              <p className="font-medium">Yield recorded</p>
              <p className="text-sm text-gray-500">Final yield percentage has been captured</p>
            </label>
            {checks.yieldRecorded ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="deviations"
              checked={checks.deviationsLogged}
              onCheckedChange={(checked) => setChecks(prev => ({ ...prev, deviationsLogged: !!checked }))}
              data-testid="check-deviations"
            />
            <label htmlFor="deviations" className="flex-1 cursor-pointer">
              <p className="font-medium">Deviations logged</p>
              <p className="text-sm text-gray-500">All deviations have been documented</p>
            </label>
            {checks.deviationsLogged ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <Checkbox
              id="material"
              checked={checks.materialBalanceOk}
              onCheckedChange={(checked) => setChecks(prev => ({ ...prev, materialBalanceOk: !!checked }))}
              data-testid="check-material"
            />
            <label htmlFor="material" className="flex-1 cursor-pointer">
              <p className="font-medium">Material balance OK</p>
              <p className="text-sm text-gray-500">Input/output reconciliation completed</p>
            </label>
            {checks.materialBalanceOk ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>
        </div>

        <div>
          <label className="font-medium block mb-2">Closure Notes</label>
          <Textarea
            placeholder="Add any notes for QA review..."
            value={closureNotes}
            onChange={(e) => setClosureNotes(e.target.value)}
            rows={3}
            data-testid="input-closure-notes"
          />
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!allChecked || createReviewMutation.isPending}
            onClick={() => createReviewMutation.mutate({
              ...checks,
              reviewStatus: "in-review",
              closureNotes,
              reviewedBy: "Current User",
              reviewedAt: new Date(),
            })}
            data-testid="button-submit-review"
          >
            {createReviewMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-2" />
            )}
            Submit for QA Review
          </Button>
        </div>

        {!allChecked && (
          <p className="text-sm text-amber-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Complete all checklist items to submit for review
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Batch Review & Closure</h1>
            <p className="text-gray-600 mt-1">Complete batch reviews and handoff to QA</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold">{reviewableBatches.filter(b => !reviews.find(r => r.batchId === b.id)).length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">In Review</p>
                    <p className="text-2xl font-bold text-blue-600">{reviews.filter(r => r.reviewStatus === "in-review").length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.reviewStatus === "approved").length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{reviews.filter(r => r.reviewStatus === "rejected").length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batches List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batches Ready for Review</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredBatches.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No batches ready for review</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredBatches.map(batch => {
                      const review = reviews.find(r => r.batchId === batch.id);
                      return (
                        <div
                          key={batch.id}
                          onClick={() => setSelectedBatchId(batch.id)}
                          className={`p-3 rounded-lg cursor-pointer border transition ${
                            selectedBatchId === batch.id
                              ? "bg-blue-50 border-blue-300"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                          data-testid={`batch-card-${batch.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{batch.batchNumber}</p>
                              <p className="text-xs text-gray-600">{batch.productName}</p>
                            </div>
                            {review ? (
                              <Badge className={
                                review.reviewStatus === "approved" ? "bg-green-100 text-green-800" :
                                review.reviewStatus === "in-review" ? "bg-blue-100 text-blue-800" :
                                review.reviewStatus === "rejected" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {review.reviewStatus}
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Needs Review</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Batch Review</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedBatch ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a batch to review</p>
                  </div>
                ) : selectedReview && selectedReview.reviewStatus === "approved" ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-semibold">Batch Approved</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Approved by {selectedReview.approvedBy} on {formatDate(selectedReview.approvedAt)}
                    </p>
                  </div>
                ) : selectedReview && selectedReview.reviewStatus === "in-review" ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <FileText className="h-5 w-5" />
                        <span className="font-semibold">Review Submitted</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Submitted by {selectedReview.reviewedBy} on {formatDate(selectedReview.reviewedAt)}
                      </p>
                      {selectedReview.closureNotes && (
                        <p className="text-sm text-gray-700 mt-2">{selectedReview.closureNotes}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        {selectedReview.allStagesCompleted ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">All stages completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReview.yieldRecorded ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">Yield recorded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReview.deviationsLogged ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">Deviations logged</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReview.materialBalanceOk ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">Material balance OK</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => approveReviewMutation.mutate(selectedReview.id)}
                      disabled={approveReviewMutation.isPending}
                      data-testid="button-approve"
                    >
                      {approveReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Approve for QA Handoff
                    </Button>
                  </div>
                ) : (
                  <ReviewChecklist batch={selectedBatch} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
