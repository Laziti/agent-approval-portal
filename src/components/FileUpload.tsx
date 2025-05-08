
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, FileText, Image } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  className?: string;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  className,
  accept = ".pdf,.png,.jpg,.jpeg"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    type: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create a folder with user ID to organize uploads
      const folderPath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("payment_receipts")
        .upload(folderPath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("payment_receipts")
        .getPublicUrl(folderPath);
      
      const fileUrl = urlData.publicUrl;

      // Set uploaded file info
      setUploadedFile({
        name: file.name,
        url: fileUrl,
        type: file.type
      });

      // Call the callback with the file URL
      onFileUploaded(fileUrl);
      toast.success("File uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onFileUploaded("");
  };

  const FileIcon = uploadedFile?.type.includes("pdf") ? FileText : Image;

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-4">Upload your payment receipt (PDF or image)</p>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="max-w-xs"
          />
          {isUploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <FileIcon className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">Uploaded</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
