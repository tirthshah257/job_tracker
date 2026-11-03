import { useState, useEffect } from 'react';
import Button from '../common/Button';
import API from '../../api/axios';

const ResultForm = ({ result, companies = [], jobs = [], onSubmit, loading, onCancel }) => {
  const [companyId, setCompanyId] = useState('');
  const [jobId, setJobId] = useState('');
  const [published, setPublished] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [fetchingApplicants, setFetchingApplicants] = useState(false);

  useEffect(() => {
    if (result) {
      const cId = result.companyId?._id || result.companyId || '';
      const jId = result.jobId?._id || result.jobId || '';
      setCompanyId(cId);
      setJobId(jId);
      setPublished(!!result.published);
      const studentIds = (result.selectedStudents || []).map((s) => s._id || s);
      setSelectedStudentIds(studentIds);
    } else if (companies.length > 0) {
      setCompanyId(companies[0]._id);
    }
  }, [result, companies]);

  // Available jobs for company
  const availableJobs = jobs.filter((j) => {
    const cId = j.companyId?._id || j.companyId;
    return cId === companyId;
  });

  // Whenever jobId changes, fetch applicants for that job
  useEffect(() => {
    if (jobId) {
      const fetchApplicants = async () => {
        try {
          setFetchingApplicants(true);
          const { data } = await API.get(`/applications/job/${jobId}`);
          setApplicants(data.data || []);
        } catch (err) {
          console.error('Error fetching job applicants:', err);
        } finally {
          setFetchingApplicants(false);
        }
      };
      fetchApplicants();
    } else {
      setApplicants([]);
    }
  }, [jobId]);

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student for placement results');
      return;
    }
    onSubmit({
      companyId,
      jobId,
      selectedStudents: selectedStudentIds,
      published,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
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
            setSelectedStudentIds([]);
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
          Job Position <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={jobId}
          onChange={(e) => {
            setJobId(e.target.value);
            setSelectedStudentIds([]);
          }}
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select a job position</option>
          {availableJobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.position} ({j.status})
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Selected Students <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-indigo-600 font-semibold">
            {selectedStudentIds.length} selected
          </span>
        </div>

        {fetchingApplicants ? (
          <p className="text-xs text-gray-500 py-3">Loading applicants for this job...</p>
        ) : !jobId ? (
          <p className="text-xs text-gray-500 py-2">Please select a job to see applicants.</p>
        ) : applicants.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            No student has applied for this job yet.
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
            {applicants.map((app) => {
              const student = app.studentId;
              if (!student) return null;
              const isChecked = selectedStudentIds.includes(student._id);
              return (
                <label
                  key={app._id}
                  className={`flex items-center gap-3 p-2.5 text-xs cursor-pointer hover:bg-gray-50 transition-colors ${
                    isChecked ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStudent(student._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                    <p className="text-gray-500">
                      Roll: {student.enrollmentNumber || 'N/A'} | {student.branch || 'N/A'} | CGPA: {student.cgpa ?? 'N/A'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    Status: {app.status}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-800">
            Publish this result immediately (Visible to students)
          </span>
        </label>
        <p className="text-xs text-gray-500 ml-6 mt-0.5">
          If unchecked, this result will remain as draft visible only to admins.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {result ? 'Update Result' : 'Save Placement Result'}
        </Button>
      </div>
    </form>
  );
};

export default ResultForm;

