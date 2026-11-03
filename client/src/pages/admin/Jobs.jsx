import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import JobForm from '../../components/forms/JobForm';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, compRes] = await Promise.all([
        API.get('/jobs'),
        API.get('/companies'),
      ]);
      setJobs(jobsRes.data.data || []);
      setCompanies(compRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load jobs data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setFormLoading(true);
      if (editingJob) {
        await API.put(`/jobs/${editingJob._id}`, formData);
        toast.success('Job details updated successfully');
      } else {
        await API.post('/jobs', formData);
        toast.success('Job opportunity created successfully');
      }
      setIsModalOpen(false);
      setEditingJob(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setDeleteLoading(true);
      await API.delete(`/jobs/${jobToDelete._id}`);
      toast.success('Job and linked applications deleted');
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredJobs = selectedCompanyFilter
    ? jobs.filter((j) => {
        const cId = j.companyId?._id || j.companyId;
        return cId === selectedCompanyFilter;
      })
    : jobs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage position openings, eligibility requirements, and application deadlines
          </p>
        </div>
        <Button
          onClick={() => {
            if (companies.length === 0) {
              toast.error('Please add at least one company before creating a job opportunity');
              return;
            }
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Post Job</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Company:</label>
        <select
          value={selectedCompanyFilter}
          onChange={(e) => setSelectedCompanyFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white max-w-xs"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.companyName}
            </option>
          ))}
        </select>
        {selectedCompanyFilter && (
          <button
            onClick={() => setSelectedCompanyFilter('')}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading ? (
        <Loader message="Loading job positions..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No Job Postings Found"
          message="No job openings match your current filter. Post a new job under a company."
          actionLabel="Post Job"
          onAction={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Position & Company</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Package</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Min CGPA & Branches</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Deadline</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{job.position}</p>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {job.companyId?.companyName || 'Unknown Company'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {job.package || <span className="text-gray-400 font-normal">Not disclosed</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p className="text-gray-700">
                          Min CGPA: <span className="font-semibold">{job.minimumCGPA ?? 'None'}</span>
                        </p>
                        <p className="text-gray-500">
                          {job.eligibleBranches?.length > 0
                            ? job.eligibleBranches.join(', ')
                            : 'All branches eligible'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {job.deadline ? (
                        <span>{new Date(job.deadline).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-gray-400">Rolling</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingJob(job);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Job"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setJobToDelete(job);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        title={editingJob ? 'Edit Job Opportunity' : 'Post New Job Opportunity'}
      >
        <JobForm
          job={editingJob}
          companies={companies}
          onSubmit={handleCreateOrUpdate}
          loading={formLoading}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Job Opportunity"
        message={`Are you sure you want to delete "${jobToDelete?.position}"? All student applications for this position will also be removed.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Jobs;

