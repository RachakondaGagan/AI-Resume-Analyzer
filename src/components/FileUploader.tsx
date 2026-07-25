import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface Props { onFileSelect?: (file: File | null) => void; }

export default function FileUploader({ onFileSelect }: Props) {
  const MAX = 20 * 1024 * 1024;
  const onDrop = useCallback((files: File[]) => { onFileSelect?.(files[0] || null); }, [onFileSelect]);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop, multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX,
  });
  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full gradient-border">
      {file ? (
        <div className="uploader-selected-file">
          <img src="/images/pdf.png" alt="pdf" className="w-10 h-10" />
          <div className="flex-1 px-3">
            <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button type="button" className="p-2 cursor-pointer bg-transparent border-none"
            onClick={() => onFileSelect?.(null)}>
            <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative p-8 text-center cursor-pointer bg-white rounded-2xl min-h-[208px] flex flex-col items-center justify-center gap-2 transition-colors duration-200 ${isDragActive ? 'bg-blue-50' : ''}`}
        >
          <input {...getInputProps()} />
          <img src="/icons/info.svg" alt="upload" className="w-16 h-16 mb-2" />
          <p className="text-lg text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-400">PDF only · max {formatSize(MAX)}</p>
        </div>
      )}
    </div>
  );
}
