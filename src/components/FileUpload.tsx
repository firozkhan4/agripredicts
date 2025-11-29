import React, { useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-800 mb-4">Upload Farm Data</h3>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Upload CSV File
      </button>
      <p className="text-sm text-gray-500 mt-2">
        Upload your farm sensor data in CSV format
      </p>
    </div>
  );
};

export default FileUpload;
