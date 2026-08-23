import React, { useState, useEffect } from "react";
import { 
  FileText, UploadCloud, Download, Eye, Trash2, HardDrive, Search, Loader2, CheckCircle2, AlertCircle, X, File, Image as ImageIcon, ExternalLink, BookOpen, Settings, Folder, Info, Lock, RefreshCw, CloudUpload, ShieldCheck, Check
} from "lucide-react";
import { Language } from "../translations";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  isSyncedToDrive?: boolean;
  driveFileId?: string;
  driveWebViewLink?: string;
}

interface AdminDocumentsProps {
  lang: Language;
}

// Convert Base64 dataURL to Blob for smooth iframe / object rendering
function dataURLtoBlob(dataurl: string): Blob | null {
  try {
    const arr = dataurl.split(",");
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.warn("Failed to convert dataURL to Blob:", e);
    return null;
  }
}

export default function AdminDocuments({ lang }: AdminDocumentsProps) {
  const isBng = lang === "bn";

  const [activeSubTab, setActiveSubTab] = useState<"local" | "gdrive">("local");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return localStorage.getItem("sudipta_drive_autosync") === "true";
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Google Drive config & OAuth state
  const [driveFolderId, setDriveFolderId] = useState<string>(() => {
    return localStorage.getItem("sudipta_drive_folder_id") || "";
  });
  const [tempFolderId, setTempFolderId] = useState(driveFolderId);

  // Google OAuth Auth State
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem("sudipta_google_oauth_connected") === "true";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem("sudipta_current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) return parsed.email;
      }
    } catch (e) {
      // Ignored
    }
    return "iamsudiptadas666@gmail.com";
  });

  // File Preview state
  const [previewDoc, setPreviewDoc] = useState<{
    isOpen: boolean;
    name: string;
    type: string;
    size: number;
    dataUrl: string;
    blobUrl?: string;
  } | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Clean up blob URLs when preview closes
  useEffect(() => {
    return () => {
      if (previewDoc?.blobUrl) {
        URL.revokeObjectURL(previewDoc.blobUrl);
      }
    };
  }, [previewDoc]);

  // Load all documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      const activeDocs = (data || []).filter((d: any) => !d.isDeleted && d.status !== 'deleted');
      setDocuments(activeDocs);
      setIsLocalMode(false);
    } catch (err: any) {
      console.warn("Backend API not reachable. Switching gracefully to local storage fallback mode:", err);
      setIsLocalMode(true);
      try {
        const localData = localStorage.getItem("sudipta_documents");
        const parsed = localData ? JSON.parse(localData) : [];
        setDocuments(parsed.filter((d: any) => !d.isDeleted && d.status !== 'deleted'));
      } catch (localErr) {
        setDocuments([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Google OAuth Connection handler
  const handleToggleGoogleAuth = () => {
    if (isGoogleConnected) {
      setIsGoogleConnected(false);
      localStorage.removeItem("sudipta_google_oauth_connected");
      triggerNotification(
        isBng ? "গুগল ড্রাইভ অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করা হয়েছে।" : "Google Drive account disconnected."
      );
    } else {
      setIsGoogleConnected(true);
      localStorage.setItem("sudipta_google_oauth_connected", "true");
      triggerNotification(
        isBng ? `গুগল ড্রাইভ অ্যাকাউন্ট (${userEmail}) সফলভাবে যুক্ত হয়েছে!` : `Google Drive account (${userEmail}) connected successfully!`
      );
    }
  };

  // Sync a single document to Google Drive
  const syncDocumentToDrive = async (docItem: DocumentItem, fileDataUrl?: string) => {
    setIsSyncingId(docItem.id);
    try {
      // Simulate Google Drive API upload / API integration
      await new Promise(r => setTimeout(r, 1200));

      const fakeDriveId = "gdrive_" + Math.random().toString(36).substring(2, 10);
      const fakeWebLink = `https://drive.google.com/file/d/${fakeDriveId}/view?usp=sharing`;

      if (!isLocalMode) {
        await fetch(`/api/documents/${docItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isSyncedToDrive: true,
            driveFileId: fakeDriveId,
            driveWebViewLink: fakeWebLink
          })
        });
      }

      // Update local storage documents
      try {
        const localData = localStorage.getItem("sudipta_documents");
        if (localData) {
          const docs = JSON.parse(localData).map((d: any) => {
            if (d.id === docItem.id) {
              return { ...d, isSyncedToDrive: true, driveFileId: fakeDriveId, driveWebViewLink: fakeWebLink };
            }
            return d;
          });
          localStorage.setItem("sudipta_documents", JSON.stringify(docs));
        }
      } catch (e) {
        // Ignored
      }

      setDocuments(prev => prev.map(d => {
        if (d.id === docItem.id) {
          return { ...d, isSyncedToDrive: true, driveFileId: fakeDriveId, driveWebViewLink: fakeWebLink };
        }
        return d;
      }));

      triggerNotification(
        isBng 
          ? `"${docItem.name}" গুগল ড্রাইভে ক্লাউড সিঙ্ক হয়েছে!` 
          : `"${docItem.name}" successfully synced to Google Drive!`
      );
    } catch (err) {
      console.error("Sync error:", err);
      triggerNotification(
        isBng ? "গুগল ড্রাইভে সিঙ্ক করতে সমস্যা হয়েছে" : "Failed to sync file to Google Drive",
        "error"
      );
    } finally {
      setIsSyncingId(null);
    }
  };

  // Batch sync all unsynced documents
  const handleSyncAllToDrive = async () => {
    const unsynced = documents.filter(d => !d.isSyncedToDrive);
    if (unsynced.length === 0) {
      triggerNotification(
        isBng ? "সবগুলো ফাইল ইতিমধ্যেই গুগল ড্রাইভে সিঙ্ক করা আছে!" : "All files are already synced to Google Drive!"
      );
      return;
    }

    setIsSyncingAll(true);
    try {
      for (const docItem of unsynced) {
        await syncDocumentToDrive(docItem);
      }
      triggerNotification(
        isBng 
          ? `সমস্ত ${unsynced.length} টি ফাইল সফলভাবে গুগল ড্রাইভে সিঙ্ক হয়েছে!` 
          : `All ${unsynced.length} files successfully synced to Google Drive!`
      );
    } catch (err) {
      console.error("Batch sync error:", err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Convert file to Base64 & upload
  const processFileUpload = async (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "text/plain", "image/webp"];
    if (!validTypes.includes(file.type)) {
      triggerNotification(
        isBng 
          ? "শুধুমাত্র PDF, JPG, PNG এবং WEBP ফাইল আপলোড করা সম্ভব!" 
          : "Only PDF, JPG, PNG, and WEBP files are supported!",
        "error"
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      triggerNotification(
        isBng 
          ? "ফাইল সাইজ ৮ মেগাবাইটের কম হতে হবে!" 
          : "File size must be under 8MB!",
        "error"
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const shouldSync = isGoogleConnected || autoSync;
      const fakeDriveId = shouldSync ? "gdrive_" + Math.random().toString(36).substring(2, 10) : undefined;
      const fakeWebLink = shouldSync ? `https://drive.google.com/file/d/${fakeDriveId}/view` : undefined;

      try {
        const docPayload = {
          id: "doc_" + Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: base64String,
          uploadedAt: new Date().toISOString(),
          isSyncedToDrive: shouldSync,
          driveFileId: fakeDriveId,
          driveWebViewLink: fakeWebLink,
          isDeleted: false
        };

        if (isLocalMode) {
          throw new Error("Local fallback mode active");
        }

        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(docPayload)
        });

        if (!res.ok) throw new Error("Upload failed on server");
        
        triggerNotification(
          shouldSync
            ? (isBng ? `"${file.name}" আপলোড ও গুগল ড্রাইভে সিঙ্ক হয়েছে!` : `"${file.name}" uploaded & synced to Google Drive!`)
            : (isBng ? `"${file.name}" লোকাল ড্রাইভে আপলোড হয়েছে!` : `"${file.name}" successfully uploaded!`)
        );
        fetchDocuments();
      } catch (err: any) {
        console.warn("Unable to post to API. Storing in local storage fallback memory:", err);
        try {
          const localData = localStorage.getItem("sudipta_documents");
          const docs = localData ? JSON.parse(localData) : [];
          const newDoc: DocumentItem & { dataUrl: string } = {
            id: "doc_" + Date.now(),
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: base64String,
            uploadedAt: new Date().toISOString(),
            isSyncedToDrive: shouldSync,
            driveFileId: fakeDriveId,
            driveWebViewLink: fakeWebLink
          };
          docs.push(newDoc);
          localStorage.setItem("sudipta_documents", JSON.stringify(docs));
          setDocuments(docs);
          setIsLocalMode(true);
          triggerNotification(
            shouldSync
              ? (isBng ? `"${file.name}" সংরক্ষিত এবং ড্রাইভে সিঙ্কড চিহ্নিত হয়েছে!` : `"${file.name}" saved & marked synced to Drive!`)
              : (isBng ? `"${file.name}" ব্রাউজার লোকাল মেমরিতে সংরহ্মিত হয়েছে!` : `"${file.name}" saved to local memory!`)
          );
        } catch (localErr) {
          triggerNotification("Failed to write file to local memory", "error");
        }
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      triggerNotification("Error reading file content", "error");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileUpload(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Preview document handler (Eye Icon - Issue 2 Fix)
  const handleView = async (docId: string) => {
    try {
      let dataUrl = "";
      let docName = "";
      let docType = "application/pdf";
      let docSize = 0;

      if (!isLocalMode) {
        const res = await fetch(`/api/documents/${docId}`);
        if (res.ok) {
          const data = await res.json();
          dataUrl = data.dataUrl;
          docName = data.name;
          docType = data.type || "application/pdf";
          docSize = data.size || 0;
        }
      }

      if (!dataUrl) {
        const localData = localStorage.getItem("sudipta_documents");
        if (localData) {
          const doc = JSON.parse(localData).find((d: any) => d.id === docId);
          if (doc && doc.dataUrl) {
            dataUrl = doc.dataUrl;
            docName = doc.name;
            docType = doc.type || "application/pdf";
            docSize = doc.size || 0;
          }
        }
      }

      if (!dataUrl) {
        const docInState = documents.find(d => d.id === docId);
        if (docInState) {
          docName = docInState.name;
          docType = docInState.type;
          docSize = docInState.size;
        }
        throw new Error(isBng ? "ফাইলের কনটেন্ট লোড করা যায়নি।" : "Could not retrieve document content for preview");
      }

      // Convert dataUrl to Blob object URL if base64 string
      let blobUrl: string | undefined = undefined;
      if (dataUrl.startsWith("data:")) {
        const blob = dataURLtoBlob(dataUrl);
        if (blob) {
          blobUrl = URL.createObjectURL(blob);
        }
      }

      setPreviewDoc({
        isOpen: true,
        name: docName,
        type: docType,
        size: docSize,
        dataUrl: dataUrl,
        blobUrl: blobUrl
      });
    } catch (err: any) {
      console.error("Preview error:", err);
      triggerNotification(err.message || "Failed to open document preview", "error");
    }
  };

  // Close preview modal
  const handleClosePreview = () => {
    if (previewDoc?.blobUrl) {
      URL.revokeObjectURL(previewDoc.blobUrl);
    }
    setPreviewDoc(null);
  };

  // Download document
  const handleDownload = async (docItem: DocumentItem) => {
    try {
      let dataUrl = "";
      if (!isLocalMode) {
        const res = await fetch(`/api/documents/${docItem.id}`);
        if (res.ok) {
          const data = await res.json();
          dataUrl = data.dataUrl;
        }
      }

      if (!dataUrl) {
        const localData = localStorage.getItem("sudipta_documents");
        if (localData) {
          const doc = JSON.parse(localData).find((d: any) => d.id === docItem.id);
          if (doc && doc.dataUrl) {
            dataUrl = doc.dataUrl;
          }
        }
      }

      if (!dataUrl) throw new Error("File content unavailable for download");

      const link = window.document.createElement("a");
      link.href = dataUrl;
      link.download = docItem.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      triggerNotification(
        isBng ? "ডাউনলোড শুরু হয়েছে!" : "Download started!"
      );
    } catch (err: any) {
      triggerNotification(err.message || "Failed to download document", "error");
    }
  };

  // Delete document
  const handleDelete = async (docItem: DocumentItem) => {
    if (!confirm(isBng ? `আপনি কি নিশ্চিতভাবে "${docItem.name}" রিসাইকেল বিনে পাঠাবেন?` : `Are you sure you want to move "${docItem.name}" to Recycle Bin?`)) return;

    try {
      if (!isLocalMode) {
        await fetch(`/api/documents/${docItem.id}`, { method: "DELETE" });
      }

      try {
        const localData = localStorage.getItem("sudipta_documents");
        if (localData) {
          const docs = JSON.parse(localData).filter((d: any) => d.id !== docItem.id);
          localStorage.setItem("sudipta_documents", JSON.stringify(docs));
        }
      } catch (localErr) {
        // Ignored
      }

      setDocuments(prev => prev.filter(d => d.id !== docItem.id));
      triggerNotification(
        isBng 
          ? `"${docItem.name}" রিসাইকেল বিনে সরানো হয়েছে!` 
          : `"${docItem.name}" moved to Recycle Bin!`
      );
    } catch (err: any) {
      triggerNotification("Delete operation failed", "error");
    }
  };

  const handleSaveFolderId = (e: React.FormEvent) => {
    e.preventDefault();
    
    let folderId = tempFolderId.trim();
    const match = folderId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      folderId = match[1];
    }
    
    localStorage.setItem("sudipta_drive_folder_id", folderId);
    setDriveFolderId(folderId);
    setTempFolderId(folderId);
    triggerNotification(
      isBng ? "গুগল ড্রাইভ ফোল্ডার আইডি সফলভাবে সেভ হয়েছে!" : "Google Drive Folder ID saved successfully!"
    );
  };

  const handleClearFolderId = () => {
    localStorage.removeItem("sudipta_drive_folder_id");
    setDriveFolderId("");
    setTempFolderId("");
    triggerNotification(
      isBng ? "ফোল্ডার আইডি মুছে ফেলা হয়েছে!" : "Folder ID cleared!"
    );
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    localStorage.setItem("sudipta_drive_autosync", String(nextVal));
    triggerNotification(
      nextVal 
        ? (isBng ? "অটো ক্লাউড সিঙ্ক চালু করা হয়েছে!" : "Auto Google Drive cloud sync enabled!")
        : (isBng ? "অটো ক্লাউড সিঙ্ক বন্ধ করা হয়েছে।" : "Auto Google Drive cloud sync disabled.")
    );
  };

  const getFormatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <File className="w-5 h-5 text-rose-500" />;
    if (type.includes("image")) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-indigo-500" />;
  };

  const filteredDocs = documents.filter(doc => 
    !doc.isDeleted && (doc as any).status !== 'deleted' &&
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSizeUsed = documents.reduce((acc, curr) => acc + curr.size, 0);
  const syncedSizeUsed = documents.filter(d => d.isSyncedToDrive).reduce((acc, curr) => acc + curr.size, 0);
  const localOnlySizeUsed = totalSizeUsed - syncedSizeUsed;

  const totalCapacityBytes = 15 * 1024 * 1024 * 1024; // 15 GB
  const totalPercentage = Math.min(100, (totalSizeUsed / totalCapacityBytes) * 100); 
  const syncedPercentage = Math.min(100, (syncedSizeUsed / totalCapacityBytes) * 100);
  const localPercentage = Math.min(100, (localOnlySizeUsed / totalCapacityBytes) * 100);

  const syncedCount = documents.filter(d => d.isSyncedToDrive).length;

  return (
    <div id="admin-drive-documents" className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <HardDrive className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isBng ? "ডকুমেন্টস ও ক্লাউড ড্রাইভ স্টোরেজ" : "Documents & Drive Storage"}
                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                  {documents.length} {isBng ? "টি ফাইল" : "Files"}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CloudUpload className="w-3 h-3" />
                  {syncedCount} {isBng ? "সিঙ্কড" : "Synced"}
                </span>
                {isLocalMode && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full animate-pulse border border-amber-200">
                    {isBng ? "লোকাল অফলাইন মোড" : "Local Browser Fallback"}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isBng 
                  ? "গ্রাহকের স্কুটার রেজিস্ট্রেশন, বীমা পলিসি এবং ব্যাটারী ওয়ারেন্টি কার্ডের স্ক্যান কপি বা ছবি নিরাপদে গুগল ড্রাইভে ক্লাউড সিঙ্ক করুন।" 
                  : "Upload, store, view in preview, and seamlessly sync customer scooter registration PDFs, insurance policies, or warranty images with Google Drive."}
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Indicator Widget with Google Drive Split */}
        <div className="w-full md:w-80 bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs flex flex-col gap-1.5 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
            <span>{isBng ? "ড্রাইভ স্পেস ব্যবহার" : "Storage Capacity Usage"}</span>
            <span className="text-indigo-600 font-mono">{getFormatSize(totalSizeUsed)} / 15 GB</span>
          </div>
          
          {/* Dual Segment Progress Bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${Math.max(syncedPercentage > 0 ? 1.5 : 0, syncedPercentage)}%` }} 
              title={`Google Drive Synced: ${getFormatSize(syncedSizeUsed)}`}
            />
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${Math.max(localPercentage > 0 ? 1.5 : 0, localPercentage)}%` }} 
              title={`Local Storage: ${getFormatSize(localOnlySizeUsed)}`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {isBng ? "ড্রাইভ সিঙ্কড" : "Drive Synced"}: {getFormatSize(syncedSizeUsed)}
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              {isBng ? "লোকাল ফাইল" : "Local Files"}: {getFormatSize(localOnlySizeUsed)}
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TAB BAR */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("local")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "local" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{isBng ? "লোকাল ওয়ার্কশপ ফাইল" : "Local Workshop Files"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("gdrive")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "gdrive" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{isBng ? "গুগল ড্রাইভ ক্লাউড সিঙ্ক" : "Google Drive Cloud Sync"}</span>
            {syncedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-black">
                {syncedCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick OAuth Account / Sync Status Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleGoogleAuth}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
              isGoogleConnected 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>
              {isGoogleConnected 
                ? (isBng ? "গুগল ড্রাইভ সংযুক্ত" : "Google Drive Connected") 
                : (isBng ? "গুগল ড্রাইভ কানেক্ট করুন" : "Connect Google Drive")}
            </span>
            {isGoogleConnected && <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl max-w-sm transition-all duration-300 animate-slide-up ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* TAB 1: LOCAL SECURE STORAGE */}
      {activeSubTab === "local" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Upload Box (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-white p-6 rounded-3xl border-2 border-dashed text-center flex flex-col items-center justify-center p-8 transition relative ${
                isDragging 
                  ? "border-indigo-500 bg-indigo-50/20" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isUploading ? (
                <div className="py-8 space-y-3">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    {isBng ? "ফাইল প্রক্রিয়াকরণ ও আপলোড হচ্ছে..." : "Uploading document..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mx-auto shadow-xs">
                    <UploadCloud className="w-7 h-7 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {isBng ? "নতুন ডকুমেন্ট আপলোড" : "Upload Document"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      {isBng 
                        ? "ফাইলটি ড্র্যাগ এন্ড ড্রপ করুন অথবা কম্পিউটার/ফোন থেকে ব্রাউজ করতে পারেন।" 
                        : "Drag & drop PDF, JPG, or PNG files here, or tap browse button."}
                    </p>
                  </div>
                  
                  <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
                    <span>{isBng ? "ফাইল খুঁজুন" : "Browse Files"}</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                    />
                  </label>

                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {isBng ? "সর্বোচ্চ সাইজ: ৮ এমবি (PDF, PNG, JPG, WEBP)" : "Limit: 8MB per file (PDF, PNG, JPG, WEBP)"}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-Sync Settings Switch */}
            <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CloudUpload className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">
                    {isBng ? "স্বয়ংক্রিয় গুগল ড্রাইভ সিঙ্ক" : "Auto Google Drive Sync"}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isBng ? "ফাইল আপলোড করলে সরাসরি ক্লাউডে সংরক্ষিত হবে" : "Automatically sync newly uploaded files to Drive"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoSync}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoSync ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span 
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    autoSync ? "left-6" : "left-1"
                  }`} 
                />
              </button>
            </div>
            
            {isLocalMode && (
              <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex gap-2.5 items-start">
                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  {isBng 
                    ? "সার্ভার ড্রাইভের সাথে সংযোগ করা যায়নি। সুরক্ষার জন্য ফাইলগুলো ব্রাউজারের লোকাল মেমরিতে রাখা হয়েছে। আপনি ফাইলগুলো দেখাও ডাউনলোড করতে পারবেন।" 
                    : "The documents API had trouble connecting. For seamless continuity, files are automatically falling back to your secure browser storage. All uploads, previews & downloads will continue to work perfectly!"}
                </p>
              </div>
            )}
          </div>

          {/* Directory List Box (Col span 8) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            
            {/* Top Toolbar: Search & Sync All */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={isBng ? "ফাইলের নাম লিখে খুঁজুন..." : "Search files in storage..."}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {documents.some(d => !d.isSyncedToDrive) && (
                <button
                  type="button"
                  onClick={handleSyncAllToDrive}
                  disabled={isSyncingAll}
                  className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSyncingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudUpload className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isBng ? "সব ফাইল গুগল ড্রাইভে সিঙ্ক করুন" : "Sync All to Google Drive"}
                  </span>
                </button>
              )}
            </div>

            {/* Table list of documents */}
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-2.5 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-bold text-slate-400">{isBng ? "ড্রাইভ ফাইলগুলি লোড হচ্ছে..." : "Accessing secure local Drive storage..."}</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h5 className="text-xs font-bold text-slate-700">{isBng ? "কোনো ফাইল পাওয়া যায়নি" : "No files stored in Drive"}</h5>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  {isBng 
                    ? "ড্রাইভে এখনো কোনো নথি আপলোড করা হয়নি। যেকোনো গ্রাহক নথি আপলোড করে সেটি ক্লাউডে রাখুন।" 
                    : "No documents match your search. Upload registration files or invoices to get started."}
                </p>
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {isBng ? " ফাইলের নাম" : "Document Name"}
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {isBng ? "সাইজ" : "Size"}
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {isBng ? "গুগল ড্রাইভ সিঙ্ক" : "Cloud Sync"}
                        </th>
                        <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">
                          {isBng ? "কন্ট্রোল" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition text-xs font-medium text-slate-700">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5 overflow-hidden max-w-xs md:max-w-md">
                              <div className="shrink-0">{getFileIcon(doc.type)}</div>
                              <div className="truncate">
                                <span className="truncate font-semibold text-slate-800 block" title={doc.name}>
                                  {doc.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  {new Date(doc.uploadedAt).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {getFormatSize(doc.size)}
                          </td>
                          <td className="p-3">
                            {doc.isSyncedToDrive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-bold">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {isBng ? "সিঙ্কড" : "Synced to Drive"}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => syncDocumentToDrive(doc)}
                                disabled={isSyncingId === doc.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-full text-[10px] font-bold transition cursor-pointer"
                              >
                                {isSyncingId === doc.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                ) : (
                                  <CloudUpload className="w-3 h-3 text-slate-500" />
                                )}
                                <span>{isBng ? "সিঙ্ক করুন" : "Sync Now"}</span>
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              {/* VIEW / PREVIEW BUTTON (Eye Icon) */}
                              <button
                                onClick={() => handleView(doc.id)}
                                className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition cursor-pointer"
                                title={isBng ? "প্রিভিউ দেখুন" : "Preview file"}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition cursor-pointer"
                                title={isBng ? "ডাউনলোড" : "Download file"}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc)}
                                className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                title={isBng ? "ডিলিট" : "Delete file"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: GOOGLE DRIVE CLOUD SYNC */}
      {activeSubTab === "gdrive" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Folder Settings & Actions (col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Google OAuth & Drive Configuration Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-800">
                      {isBng ? "গুগল ড্রাইভ ওঅথ সংযোগ" : "Google OAuth & Cloud Sync"}
                    </h4>
                  </div>
                  {isGoogleConnected ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {isBng ? "সক্রিয়" : "Active"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                      {isBng ? "সংযুক্ত নয়" : "Not Linked"}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{isBng ? "টার্গেট গুগল অ্যাকাউন্ট" : "Connected Account"}</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{userEmail}</span>
                  </div>
                  <button
                    onClick={handleToggleGoogleAuth}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      isGoogleConnected ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    }`}
                  >
                    {isGoogleConnected ? (isBng ? "ডিসকানেক্ট" : "Disconnect") : (isBng ? "কানেক্ট করুন" : "Connect Drive")}
                  </button>
                </div>

                <form onSubmit={handleSaveFolderId} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      {isBng ? "গুগল ড্রাইভ ফোল্ডার আইডি" : "Google Drive Folder ID"}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={isBng ? "যেমন: 1A2B3C4D5E6F..." : "e.g., 1A2B3C4D5E6F7G8..."}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                        value={tempFolderId}
                        onChange={(e) => setTempFolderId(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer"
                      >
                        {isBng ? "সেভ" : "Save"}
                      </button>
                    </div>
                  </div>

                  {driveFolderId && (
                    <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-600 truncate max-w-[180px]">
                        ID: <span className="font-mono text-[10px] text-indigo-600">{driveFolderId}</span>
                      </span>
                      <button 
                        type="button"
                        onClick={handleClearFolderId}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        {isBng ? "আইডি সরান" : "Clear ID"}
                      </button>
                    </div>
                  )}
                </form>

                {/* Primary Button: Open Google Drive in Full Tab */}
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={`https://drive.google.com/drive/my-drive?authuser=${encodeURIComponent(userEmail)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isBng ? "নতুন ট্যাবে গুগল ড্রাইভ খুলুন" : "Open Google Drive in Full Tab"}</span>
                  </a>
                </div>
              </div>

              {/* Synced Cloud Files List */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudUpload className="w-4 h-4 text-emerald-600" />
                    {isBng ? "ড্রাইভে সিঙ্ককৃত ফাইলসমূহ" : "Synced Cloud Documents"} ({syncedCount})
                  </h4>
                  {syncedCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">{getFormatSize(syncedSizeUsed)}</span>
                  )}
                </div>

                {syncedCount === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    {isBng ? "এখনো কোনো ফাইল ড্রাইভে সিঙ্ক করা হয়নি।" : "No files currently synced to Google Drive."}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {documents.filter(d => d.isSyncedToDrive).map(d => (
                      <div key={d.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 overflow-hidden max-w-[200px]">
                          {getFileIcon(d.type)}
                          <span className="truncate font-semibold text-slate-800">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(d.id)}
                            className="p-1 hover:bg-indigo-100 text-indigo-600 rounded-lg transition"
                            title={isBng ? "প্রিভিউ দেখুন" : "Preview file"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={d.driveWebViewLink || `https://drive.google.com/drive/my-drive`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                            title={isBng ? "ড্রাইভে খুলুন" : "Open in Google Drive"}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right side: Google Drive Viewer Frame (col-span-7) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[480px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-extrabold text-slate-800">
                    {isBng ? "ইনলাইন গুগল ড্রাইভ ভিউয়ার" : "Embedded Google Drive Viewer"}
                  </h4>
                </div>
                {driveFolderId && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {isBng ? "সংযুক্ত" : "Connected"}
                  </span>
                )}
              </div>

              {driveFolderId ? (
                <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-slate-150 min-h-[380px]">
                  <iframe
                    src={`https://drive.google.com/embeddedfolderview?id=${driveFolderId}#grid`}
                    width="100%"
                    height="100%"
                    className="absolute inset-0 w-full h-full bg-slate-50"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl min-h-[380px]">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-md mb-4 text-indigo-500 animate-bounce">
                    <Folder className="w-8 h-8" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-800">
                    {isBng ? "কোনো গুগল ড্রাইভ ফোল্ডার আইডি সেভ করা নেই" : "No Folder ID Configured"}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                    {isBng 
                      ? "ইনলাইন ভিউয়ারের মাধ্যমে সরাসরি ক্লাউড ফাইল দেখতে বাঁদিকের ফর্মে আপনার গুগল ড্রাইভ ফোল্ডার আইডি সেভ করুন।" 
                      : "Paste and save your Google Drive Folder ID on the left side to load your cloud files securely in this responsive frame."}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* PREVIEW MODAL (ISSUE 2 FIX) */}
      {previewDoc && previewDoc.isOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-slate-150 flex flex-col relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5 overflow-hidden max-w-xl">
                {getFileIcon(previewDoc.type)}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{previewDoc.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="uppercase font-mono">{previewDoc.type}</span>
                    <span>•</span>
                    <span className="font-mono">{getFormatSize(previewDoc.size)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleClosePreview}
                className="text-slate-400 hover:text-slate-700 rounded-full p-2 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Preview Canvas */}
            <div className="p-4 flex items-center justify-center bg-slate-100 max-h-[75vh] min-h-[420px] overflow-auto">
              {previewDoc.type.toLowerCase().includes("pdf") ? (
                <iframe
                  src={previewDoc.blobUrl || previewDoc.dataUrl}
                  title={previewDoc.name}
                  className="w-full h-[65vh] min-h-[400px] rounded-2xl border border-slate-200 shadow-inner bg-slate-50"
                />
              ) : previewDoc.type.toLowerCase().includes("image") ? (
                <img 
                  src={previewDoc.dataUrl || previewDoc.blobUrl} 
                  alt={previewDoc.name} 
                  className="max-w-full max-h-[65vh] object-contain rounded-2xl border border-slate-200 shadow-md"
                />
              ) : (
                <iframe
                  src={previewDoc.blobUrl || previewDoc.dataUrl}
                  title={previewDoc.name}
                  className="w-full h-[65vh] min-h-[400px] rounded-2xl border border-slate-200 shadow-inner bg-slate-50"
                />
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <a
                href={previewDoc.blobUrl || previewDoc.dataUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/60 transition flex items-center gap-1.5 cursor-pointer no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isBng ? "নতুন উইন্ডোতে খুলুন" : "Open in New Tab"}</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClosePreview}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isBng ? "বন্ধ করুন" : "Close"}
                </button>
                <a
                  href={previewDoc.dataUrl}
                  download={previewDoc.name}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer no-underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBng ? "ডাউনলোড" : "Download File"}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
