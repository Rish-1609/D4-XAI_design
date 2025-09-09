import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType?: string;
}

/**
 * Document viewer component for displaying PDFs and Word documents
 * 
 * Features:
 * - PDF preview using iframe
 * - Word document preview via Office Online viewer
 * - Download functionality
 * - External link to open in new tab
 */
export function DocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${documentName} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the document",
        variant: "destructive",
      });
    }
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, '_blank');
  };

  const renderDocumentPreview = () => {
    const fileExtension = documentName.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <iframe
          src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
          className="w-full h-[70vh] border-0"
          title={documentName}
          onLoad={() => setIsLoading(false)}
        />
      );
    } else if (fileExtension === 'doc' || fileExtension === 'docx') {
      // Use Office Online viewer for Word documents
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`;
      
      return (
        <iframe
          src={officeViewerUrl}
          className="w-full h-[70vh] border-0"
          title={documentName}
          onLoad={() => setIsLoading(false)}
        />
      );
    } else {
      return (
        <div className="w-full h-[70vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              Preview not available for this file type
            </div>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {documentName}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                data-testid="button-download-document"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                data-testid="button-open-external"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-viewer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Loading document...</div>
              </div>
            </div>
          )}
          {renderDocumentPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}