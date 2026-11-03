import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ResultForm from '../../components/forms/ResultForm';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, compRes, jobsRes] = await Promise.all([
        API.get('/results'),
        API.get('/companies'),
        API.get('/jobs'),
      ]);
      setResults(resRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load placement results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (payload) => {
    try {
      setFormLoading(true);
      if (editingResult) {
        await API.put(`/results/${editingResult._id}`, payload);
        toast.success('Placement result updated');
      } else {
        await API.post('/results', payload);
        toast.success('Placement result created');
      }
      setIsModalOpen(false);
      setEditingResult(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const togglePublish = async (result) => {
    try {
      const newStatus = !result.published;
      await API.put(`/results/${result._id}`, { published: newStatus });
      toast.success(newStatus ? 'Result published to students!' : 'Result unpublished (draft mode)');
      fetchData();
    } catch (err) {
      toast.error('Failed to update publication status');
    }
  };

  const confirmDelete = async () => {
    if (!resultToDelete) return;
    try {
      setDeleteLoading(true);
      await API.delete(`/results/${resultToDelete._id}`);
      toast.success('Placement result deleted');
      setDeleteDialogOpen(false);
      setResultToDelete(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete result');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, publish, and announce final student selections for company drives
          </p>
        </div>
        <Button
          onClick={() => {
            if (companies.length === 0 || jobs.length === 0) {
              toast.error('Please ensure at least one company and job exist before publishing results');
              return;
            }
            setEditingResult(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Publish Result</span>
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading placement results..." />
      ) : results.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No Placement Results Published Yet"
          message="Once recruitment processes conclude, record and publish selected students here."
          actionLabel="Create Result"
          onAction={() => {
            setEditingResult(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Company & Position</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Selected Students</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Visibility Status</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Published Date</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((res) => (
                  <tr key={res._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {res.companyId?.companyName || 'Unknown Company'}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium">
                        {res.jobId?.position || 'Job position'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold text-gray-900">
                          {res.selectedStudents?.length || 0} student(s) selected
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1 max-w-xs">
                          {res.selectedStudents?.slice(0, 3).map((s) => (
                            <span
                              key={s._id}
                              className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs"
                            >
                              {s.name} ({s.branch || 'Student'})
                            </span>
                          ))}
                          {res.selectedStudents?.length > 3 && (
                            <span className="text-gray-400 text-xs self-center">
                              +{res.selectedStudents.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {res.published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Published (Live)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <HiOutlineEyeOff className="w-3.5 h-3.5" /> Draft (Hidden)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => togglePublish(res)}
                        className={`p-1.5 rounded-lg transition-colors text-xs font-medium px-2 py-1 ${
                          res.published
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                        title={res.published ? 'Unpublish' : 'Publish'}
                      >
                        {res.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingResult(res);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Result"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setResultToDelete(res);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Result"
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

      {/* Result Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResult(null);
        }}
        title={editingResult ? 'Edit Placement Result' : 'Publish Placement Result'}
      >
        <ResultForm
          result={editingResult}
          companies={companies}
          jobs={jobs}
          onSubmit={handleCreateOrUpdate}
          loading={formLoading}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingResult(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Result Record"
        message="Are you sure you want to delete this placement result? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

export default Results;
