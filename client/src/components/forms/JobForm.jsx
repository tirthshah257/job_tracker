import { useState, useEffect } from 'react';
import Button from '../common/Button';

const BRANCH_OPTIONS = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AI/ML', 'Other'];

const JobForm = ({ job, companies = [], onSubmit, loading, onCancel }) => {
  const [formData, setFormData] = useState({
    companyId: '',
    position: '',
    description: '',
    requiredSkills: '',
    eligibilityCriteria: '',
    minimumCGPA: 0,
    eligibleBranches: [],
    package: '',
    deadline: '',
    recruitmentProcess: '',
    status: 'Upcoming',
  });

  useEffect(() => {
    if (job) {
      setFormData({
        companyId: job.companyId?._id || job.companyId || '',
        position: job.position || '',
        description: job.description || '',
        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
        eligibilityCriteria: job.eligibilityCriteria || '',
        minimumCGPA: job.minimumCGPA ?? 0,
        eligibleBranches: job.eligibleBranches || [],
        package: job.package || '',
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        recruitmentProcess: job.recruitmentProcess || '',
        status: job.status || 'Upcoming',
      });
    } else if (companies.length > 0) {
      setFormData((prev) => ({ ...prev, companyId: companies[0]._id }));
    }
  }, [job, companies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchToggle = (branch) => {
    setFormData((prev) => {
      const exists = prev.eligibleBranches.includes(branch);
      return {
        ...prev,
        eligibleBranches: exists
          ? prev.eligibleBranches.filter((b) => b !== branch)
          : [...prev.eligibleBranches, branch],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      requiredSkills: skillsArray,
      minimumCGPA: parseFloat(formData.minimumCGPA) || 0,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Job Position <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="position"
            required
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g. Graduate Software Engineer"
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package / CTC</label>
          <input
            type="text"
            name="package"
            value={formData.package}
            onChange={handleChange}
            placeholder="e.g. 12 LPA"
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            name="minimumCGPA"
            value={formData.minimumCGPA}
            onChange={handleChange}
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Skills (comma separated)
        </label>
        <input
          type="text"
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          placeholder="e.g. React, Node.js, Python, SQL"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Eligible Branches (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {BRANCH_OPTIONS.map((branch) => {
            const isSelected = formData.eligibleBranches.includes(branch);
            return (
              <button
                type="button"
                key={branch}
                onClick={() => handleBranchToggle(branch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {branch}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
        <textarea
          name="eligibilityCriteria"
          rows={2}
          value={formData.eligibilityCriteria}
          onChange={handleChange}
          placeholder="e.g. No active backlogs, 60% in 10th and 12th"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recruitment Process</label>
        <textarea
          name="recruitmentProcess"
          rows={2}
          value={formData.recruitmentProcess}
          onChange={handleChange}
          placeholder="e.g. 1. Online Aptitude Test -> 2. Technical Round -> 3. HR Round"
          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed role description and responsibilities..."
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
          {job ? 'Update Job' : 'Add Job Opportunity'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;

