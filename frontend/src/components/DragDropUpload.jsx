import { UploadCloud } from "lucide-react";
import { useState } from "react";

const DragDropUpload = ({ label, name, multiple = false, files, onFilesChange }) => {
  const [dragging, setDragging] = useState(false);
  const fileList = Array.isArray(files) ? files : files ? [files] : [];

  const handleFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles || []);
    onFilesChange(name, multiple ? nextFiles : nextFiles[0] || null);
  };

  return (
    <label
      className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-4 text-center transition ${
        dragging ? "border-purple-300 bg-purple-500/16" : "border-white/14 bg-white/[0.035] hover:border-purple-300/50 hover:bg-purple-500/10"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <UploadCloud className="text-purple-100" size={24} />
      <span className="mt-2 text-sm font-bold text-white">{label}</span>
      <span className="mt-1 text-xs text-white/42">{fileList.length ? `${fileList.length} file(s) selected` : "Drop files here or browse"}</span>
      <input
        className="sr-only"
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
};

export default DragDropUpload;
