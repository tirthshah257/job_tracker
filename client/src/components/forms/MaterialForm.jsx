import { useState, useEffect } from 'react';
import Button from '../common/Button';

const MaterialForm = ({ companies = [], jobs = [], onSubmit, loading, onCancel }) => {
  const [companyId, setCompanyId] = useState('');
  const [jobId, setJobId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (companies.length > 0 && !companyId) {
      setCompanyId(companies[0]._id);
    }
  }, [companies, companyId]);

  // Filter jobs by selected company
  const availableJobs = jobs.filter((j) => {
    const cId = j.companyId?._id || j.companyId;
    return cId === companyId;
  });

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one PDF file');
      return;
    }

    const data = new FormData();
    data.append('companyId', companyId);
    if (jobId) data.append('jobId', jobId);
    data.append('title', title);
    data.append('description', description);

    files.forEach((file) => {
      data.append('files', file);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value);
            setJobId('');
          }}
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select a company</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Position (Optional - link to specific job)
        </label>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">General Company Material (No specific job)</option>
          {availableJobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.position}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Aptitude Test Preparation Guide, Syllabus"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">If left blank, original file name will be used.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of document contents..."
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select PDF Document(s) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          multiple
          required
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
        />
        {files.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
            <span className="font-semibold">{files.length} file(s) selected:</span>
            <ul className="list-disc list-inside mt-1">
              {files.map((f, i) => (
                <li key={i}>{f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Upload Materials
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;

