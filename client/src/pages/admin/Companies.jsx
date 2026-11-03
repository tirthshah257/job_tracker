import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import CompanyForm from '../../components/forms/CompanyForm';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding, HiOutlineExternalLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/companies');
      setCompanies(data.data || []);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setFormLoading(true);
      if (editingCompany) {
        await API.put(`/companies/${editingCompany._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Company updated successfully');
      } else {
        await API.post('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Company added successfully');
      }
      setIsModalOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      setDeleteLoading(true);
      await API.delete(`/companies/${companyToDelete._id}`);
      toast.success('Company and related records deleted');
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-sm text-gray-500 mt-1">Register and maintain recruiting partner organizations</p>
        </div>
        <Button
          onClick={() => {
            setEditingCompany(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading companies..." />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={HiOutlineOfficeBuilding}
          title="No Companies Added Yet"
          message="Get started by registering the first company participating in the placement season."
          actionLabel="Add Company"
          onAction={() => {
            setEditingCompany(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Company</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Location</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Website</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img
                            src={`http://localhost:5000/${company.logo.replace(/\\/g, '/')}`}
                            alt={company.companyName}
                            className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200 p-1 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-indigo-100">
                            {company.companyName?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{company.companyName}</p>
                          {company.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{company.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {company.location || <span className="text-gray-400">Not specified</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline text-xs"
                        >
                          Visit site <HiOutlineExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCompany(company);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Company"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCompanyToDelete(company);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Company"
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
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={handleCreateOrUpdate}
          loading={formLoading}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCompany(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.companyName}"? This will permanently delete all associated jobs, uploaded materials, student applications, announcements, and results.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Companies;

