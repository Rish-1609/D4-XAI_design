import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { materialsApi } from "@/lib/api";
import { type Material } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Eye, Edit2, Trash2, CheckCircle, Clock, XCircle, Box } from "lucide-react";
import { AddMaterialDialog } from "./add-material-dialog";

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
  pending: {
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
    label: "Pending Review",
  },
  failed: {
    icon: XCircle,
    className: "bg-red-100 text-red-800",
    label: "Failed/Requires Action",
  },
  "under-testing": {
    icon: Clock,
    className: "bg-purple-100 text-purple-800",
    label: "Under Testing",
  },
};

export function MaterialTable({ materialType, title }: MaterialTableProps) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["/api/materials", materialType],
    queryFn: () => materialsApi.getByType(materialType),
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-700">Material Details</TableHead>
                <TableHead className="font-medium text-gray-700">Type & Code</TableHead>
                <TableHead className="font-medium text-gray-700">Batch & Supplier</TableHead>
                <TableHead className="font-medium text-gray-700">Quality Status</TableHead>
                <TableHead className="font-medium text-gray-700">Stock & Score</TableHead>
                <TableHead className="font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
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
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => {
                  const statusInfo = statusConfig[material.status as keyof typeof statusConfig];
                  const StatusIcon = statusInfo?.icon || Clock;

                  return (
                    <TableRow 
                      key={material.id} 
                      className="hover:bg-gray-50"
                      data-testid={`row-material-${material.id}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900" data-testid={`text-material-name-${material.id}`}>
                            {material.name}
                          </p>
                          {material.description && (
                            <p className="text-sm text-gray-500" data-testid={`text-material-description-${material.id}`}>
                              {material.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            {material.category}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1" data-testid={`text-material-code-${material.id}`}>
                            {material.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {material.batchNumber && (
                            <p className="text-sm font-medium text-gray-900" data-testid={`text-material-batch-${material.id}`}>
                              Batch: {material.batchNumber}
                            </p>
                          )}
                          {material.supplierName && (
                            <p className="text-sm text-gray-600" data-testid={`text-material-supplier-${material.id}`}>
                              {material.supplierName}
                            </p>
                          )}
                          {material.receiptDate && (
                            <p className="text-xs text-gray-500" data-testid={`text-material-receipt-${material.id}`}>
                              Received: {new Date(material.receiptDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo?.className || "bg-gray-100 text-gray-800"}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo?.label || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900" data-testid={`text-material-stock-${material.id}`}>
                            {material.stock} units
                          </p>
                          {material.score !== null && material.score !== undefined && (
                            <p className="text-sm text-gray-500" data-testid={`text-material-score-${material.id}`}>
                              Score: {material.score}%
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900" data-testid={`text-material-reference-${material.id}`}>
                          {material.referenceNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" data-testid={`button-view-${material.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-${material.id}`}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setMaterialToDelete(material)}
                            data-testid={`button-delete-${material.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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
