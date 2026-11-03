import { useRef, useState } from 'react';
import { HiOutlineDocumentText } from 'react-icons/hi';

const FileUpload = ({ accept, multiple = false, onChange, label = 'Upload File' }) => {
  const inputRef = useRef(null);
  const [fileNames, setFileNames] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((f) => f.name);
      setFileNames(names);
      if (onChange) {
        onChange(multiple ? files : files[0]);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((f) => f.name);
      setFileNames(names);
      if (onChange) {
        onChange(multiple ? files : files[0]);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <HiOutlineDocumentText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Drag & drop or click to select
        </p>
        {accept && (
          <p className="text-xs text-gray-400 mt-1">Accepted: {accept}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {fileNames.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileNames.map((name, idx) => (
            <p key={idx} className="text-sm text-gray-600 flex items-center gap-1">
              <HiOutlineDocumentText className="w-4 h-4 text-gray-400" />
              {name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
