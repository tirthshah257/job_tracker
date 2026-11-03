import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import MaterialForm from '../../components/forms/MaterialForm';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDownload, HiOutlineDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matRes, compRes, jobsRes] = await Promise.all([
        API.get('/materials'),
        API.get('/companies'),
        API.get('/jobs'),
      ]);
      setMaterials(matRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load company materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (formData) => {
    try {
      setUploadLoading(true);
      await API.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Materials uploaded successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload materials');
    } finally {
      setUploadLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      setDeleteLoading(true);
      await API.delete(`/materials/${materialToDelete._id}`);
      toast.success('Material deleted');
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await API.get(`/materials/download/${material._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${material.title || 'material'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Could not download file');
    }
  };

  const filteredMaterials = selectedCompanyFilter
    ? materials.filter((m) => {
        const cId = m.companyId?._id || m.companyId;
        return cId === selectedCompanyFilter;
      })
    : materials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Materials Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload preparation documents, interview questions, aptitude material, and recruitment guidelines
          </p>
        </div>
        <Button
          onClick={() => {
            if (companies.length === 0) {
              toast.error('Please add a company first before uploading materials');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Upload PDFs</span>
        </Button>
      </div>

      {/* Filter */}
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
        <Loader message="Loading materials..." />
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No Preparation Materials Found"
          message="Upload company study guides, aptitude test resources, or interview prep materials for students."
          actionLabel="Upload Material"
          onAction={() => {
            if (companies.length === 0) {
              toast.error('Please add a company first');
              return;
            }
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Document Title</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Company & Job</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Uploaded On</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-red-100">
                          PDF
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-medium text-gray-800">
                        {item.companyId?.companyName || 'General'}
                      </p>
                      <p className="text-gray-500">
                        {item.jobId?.position ? `Role: ${item.jobId.position}` : 'General Material'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {new Date(item.uploadedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <HiOutlineDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setMaterialToDelete(item);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Material"
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

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Company Study Materials">
        <MaterialForm
          companies={companies}
          jobs={jobs}
          onSubmit={handleUpload}
          loading={uploadLoading}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message={`Are you sure you want to permanently delete "${materialToDelete?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Materials;

