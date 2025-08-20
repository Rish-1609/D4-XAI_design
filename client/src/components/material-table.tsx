import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { materialsApi } from "@/lib/api";
import { type Material, type TestResult, type TestConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Edit2, Trash2, CheckCircle, Clock, XCircle, Box, ChevronDown, ChevronRight, TestTube, FlaskConical, Beaker } from "lucide-react";
import { AddMaterialDialog } from "./add-material-dialog";
import { queryClient } from "@/lib/queryClient";

interface MaterialTableProps {
  materialType: string;
  title: string;
}

const statusConfig = {
  approved: {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800",
    label: "Approved",
  },
  "qc-passed": {
    icon: CheckCircle,
    className: "bg-green-100 text-green-800",
    label: "QC Pass",
  },
  pending: {
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
    label: "Pending Review",
  },
  "ready-for-qc": {
    icon: Clock,
    className: "bg-blue-100 text-blue-800",
    label: "Ready for QC",
  },
  "in-progress": {
    icon: Clock,
    className: "bg-purple-100 text-purple-800",
    label: "In Progress",
  },
  "under-testing": {
    icon: Clock,
    className: "bg-purple-100 text-purple-800",
    label: "Under Testing",
  },
  failed: {
    icon: XCircle,
    className: "bg-red-100 text-red-800",
    label: "Failed",
  },
  "qc-failed": {
    icon: XCircle,
    className: "bg-red-100 text-red-800",
    label: "QC Fail",
  },
};

export function MaterialTable({ materialType, title }: MaterialTableProps) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [testResultDialogs, setTestResultDialogs] = useState<Record<string, boolean>>({});
  const [testResultForm, setTestResultForm] = useState<{
    id?: string;
    resultValue: string;
    testedBy: string;
    remarks: string;
  }>({ resultValue: '', testedBy: '', remarks: '' });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["/api/materials", materialType],
    queryFn: () => materialsApi.getByType(materialType),
  });

  const { data: testResults = [] } = useQuery({
    queryKey: ["/api/test-results"],
  });

  const { data: testConfigs = [] } = useQuery({
    queryKey: ["/api/test-configs"],
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: materialsApi.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material has been deleted successfully.",
      });
      setMaterialToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete material.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (material: Material) => {
    if (!material.id) return;
    await deleteMaterialMutation.mutateAsync(material.id);
  };

  const toggleMaterialExpansion = (materialId: string) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const getMaterialTestResults = (materialId: string): (TestResult & { testConfig?: TestConfig })[] => {
    const materialTests = (testResults as TestResult[]).filter(tr => tr.materialId === materialId);
    return materialTests.map(tr => ({
      ...tr,
      testConfig: (testConfigs as TestConfig[]).find(tc => tc.id === tr.testConfigId)
    }));
  };

  const updateTestResultMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await fetch(`/api/test-results/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) throw new Error('Failed to update test result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quality-stats"] });
      toast({ title: "Success", description: "Test result updated successfully" });
      setTestResultDialogs({});
      setTestResultForm({ resultValue: '', testedBy: '', remarks: '' });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update test result", variant: "destructive" });
    }
  });

  const handleSaveTestResult = (testResultId: string) => {
    updateTestResultMutation.mutate({
      id: testResultId,
      updates: {
        resultValue: testResultForm.resultValue,
        testedBy: testResultForm.testedBy,
        remarks: testResultForm.remarks,
        testedDate: new Date(),
      }
    });
  };

  const openTestResultDialog = (testResult: TestResult) => {
    setTestResultForm({
      id: testResult.id,
      resultValue: testResult.resultValue || '',
      testedBy: testResult.testedBy || '',
      remarks: testResult.remarks || ''
    });
    setTestResultDialogs({ [testResult.id]: true });
  };

  const getStatusIcon = (category: string) => {
    switch (category) {
      case "Chemical": return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case "Physical": return <Beaker className="w-4 h-4 text-green-600" />;
      case "Microbiological": return <TestTube className="w-4 h-4 text-purple-600" />;
      default: return <TestTube className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button disabled>
            Add {title.slice(0, -1)}
          </Button>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200" data-testid={`table-${materialType}`}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid={`button-add-${materialType}`}
          >
            Add {title.slice(0, -1)}
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {materials.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Box className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No {title.toLowerCase()} found. Add your first {title.slice(0, -1).toLowerCase()}.
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid={`button-add-first-${materialType}`}
                >
                  Add {title.slice(0, -1)}
                </Button>
              </div>
            </div>
          ) : (
            materials.map((material) => {
              const statusInfo = statusConfig[material.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo?.icon || Clock;
              const isExpanded = expandedMaterials.has(material.id);
              const materialTests = getMaterialTestResults(material.id);

              return (
                <div key={material.id} className="border rounded-lg bg-white" data-testid={`material-card-${material.id}`}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleMaterialExpansion(material.id)}>
                    <CollapsibleTrigger asChild>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900" data-testid={`text-material-name-${material.id}`}>
                                {material.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">{material.category}</Badge>
                                <span className="text-sm text-gray-500">{material.code}</span>
                                {material.batchNumber && (
                                  <span className="text-sm text-gray-500">• Batch: {material.batchNumber}</span>
                                )}
                                {material.jobId && (
                                  <span className="text-sm font-medium text-blue-600">• Job: {material.jobId}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={statusInfo?.className || "bg-gray-100 text-gray-800"}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo?.label || "Unknown"}
                            </Badge>
                            {material.score !== null && material.score !== undefined && (
                              <Badge variant="outline" className="text-sm">
                                Score: {material.score}%
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-sm">
                              {materialTests.length} test{materialTests.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-gray-50 p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Reference:</span>
                              <p className="text-gray-600">{material.referenceNumber}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Stock:</span>
                              <p className="text-gray-600">{material.stock} units</p>
                            </div>
                            {material.jobId && (
                              <div>
                                <span className="font-medium text-gray-700">Job ID:</span>
                                <p className="text-blue-600 font-mono">{material.jobId}</p>
                              </div>
                            )}
                            {material.supplierName && (
                              <div>
                                <span className="font-medium text-gray-700">Supplier:</span>
                                <p className="text-gray-600">{material.supplierName}</p>
                              </div>
                            )}
                          </div>
                          
                          {materialTests.length > 0 && (
                            <div className="mt-6">
                              <h5 className="font-semibold text-gray-900 mb-3">Quality Control Tests</h5>
                              <div className="grid grid-cols-1 gap-3">
                                {materialTests.map((testResult) => (
                                  <div key={testResult.id} className="bg-white border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        {testResult.testConfig && getStatusIcon(testResult.testConfig.category)}
                                        <div>
                                          <p className="font-medium text-sm">
                                            {testResult.testConfig?.name || 'Test Configuration'}
                                          </p>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                              {testResult.testConfig?.code}
                                            </Badge>
                                            <Badge 
                                              className={
                                                testResult.status === 'passed' ? 'bg-green-100 text-green-800' :
                                                testResult.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                testResult.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                              }
                                            >
                                              {testResult.status.charAt(0).toUpperCase() + testResult.status.slice(1)}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {testResult.resultValue && (
                                          <span className="text-sm font-medium text-gray-700">
                                            {testResult.resultValue}
                                          </span>
                                        )}
                                        <Dialog 
                                          open={testResultDialogs[testResult.id] || false} 
                                          onOpenChange={(open) => setTestResultDialogs({...testResultDialogs, [testResult.id]: open})}
                                        >
                                          <DialogTrigger asChild>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => openTestResultDialog(testResult)}
                                              data-testid={`button-edit-test-${testResult.id}`}
                                            >
                                              {testResult.resultValue ? 'Edit Result' : 'Add Result'}
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Test Result - {testResult.testConfig?.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              {testResult.testConfig?.expectedRange && (
                                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                  <span className="font-medium">Expected Range:</span> {testResult.testConfig.expectedRange} {testResult.testConfig.units}
                                                </div>
                                              )}
                                              <div>
                                                <Label htmlFor="resultValue">Test Result *</Label>
                                                <Input
                                                  id="resultValue"
                                                  value={testResultForm.resultValue}
                                                  onChange={(e) => setTestResultForm({...testResultForm, resultValue: e.target.value})}
                                                  placeholder="Enter test result"
                                                  data-testid="input-test-result-value"
                                                />
                                              </div>
                                              <div>
                                                <Label htmlFor="testedBy">Tested By</Label>
                                                <Input
                                                  id="testedBy"
                                                  value={testResultForm.testedBy}
                                                  onChange={(e) => setTestResultForm({...testResultForm, testedBy: e.target.value})}
                                                  placeholder="Analyst name"
                                                  data-testid="input-tested-by"
                                                />
                                              </div>
                                              <div>
                                                <Label htmlFor="remarks">Remarks</Label>
                                                <Textarea
                                                  id="remarks"
                                                  value={testResultForm.remarks}
                                                  onChange={(e) => setTestResultForm({...testResultForm, remarks: e.target.value})}
                                                  placeholder="Additional notes"
                                                  data-testid="textarea-test-remarks"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                              <Button 
                                                variant="outline" 
                                                onClick={() => setTestResultDialogs({})}
                                              >
                                                Cancel
                                              </Button>
                                              <Button 
                                                onClick={() => handleSaveTestResult(testResult.id)}
                                                disabled={!testResultForm.resultValue.trim()}
                                                data-testid="button-save-test-result"
                                              >
                                                Save Result
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                    {testResult.testConfig?.acceptanceCriteria && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        <span className="font-medium">Criteria:</span> {testResult.testConfig.acceptanceCriteria}
                                      </div>
                                    )}
                                    {testResult.testedBy && testResult.testedDate && (
                                      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
                                        <span>Tested by: {testResult.testedBy}</span>
                                        <span>Date: {new Date(testResult.testedDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button variant="ghost" size="sm" data-testid={`button-view-${material.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${material.id}`}>
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setMaterialToDelete(material)}
                              data-testid={`button-delete-${material.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddMaterialDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        materialType={materialType}
      />

      <AlertDialog 
        open={!!materialToDelete} 
        onOpenChange={() => setMaterialToDelete(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-material">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the material
              "{materialToDelete?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => materialToDelete && handleDelete(materialToDelete)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
