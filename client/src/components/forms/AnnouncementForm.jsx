import { useState, useEffect } from 'react';
import Button from '../common/Button';

const AnnouncementForm = ({
  announcement,
  companies = [],
  jobs = [],
  onSubmit,
  loading,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    companyId: '',
    jobId: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        companyId: announcement.companyId?._id || announcement.companyId || '',
        jobId: announcement.jobId?._id || announcement.jobId || '',
        title: announcement.title || '',
        description: announcement.description || '',
      });
    } else if (companies.length > 0) {
      setFormData((prev) => ({ ...prev, companyId: companies[0]._id }));
    }
  }, [announcement, companies]);

  // Filter jobs based on selected company
  const availableJobs = jobs.filter((j) => {
    const cId = j.companyId?._id || j.companyId;
    return cId === formData.companyId;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'companyId' ? { jobId: '' } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ...(formData.jobId ? {} : { jobId: undefined }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <select
          name="companyId"
          required
          value={formData.companyId}
          onChange={handleChange}
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
          Specific Job (Optional)
        </label>
        <select
          name="jobId"
          value={formData.jobId}
          onChange={handleChange}
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Company-wide Announcement</option>
          {availableJobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.position}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Aptitude Test Date Announced"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Details <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Test will be conducted online on Friday at 10 AM. Link will be emailed."
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {announcement ? 'Update Announcement' : 'Post Announcement'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;

