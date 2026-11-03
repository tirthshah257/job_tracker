import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import AnnouncementForm from '../../components/forms/AnnouncementForm';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBell } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [annToDelete, setAnnToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, compRes, jobsRes] = await Promise.all([
        API.get('/announcements'),
        API.get('/companies'),
        API.get('/jobs'),
      ]);
      setAnnouncements(annRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load announcements');
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
      if (editingAnnouncement) {
        await API.put(`/announcements/${editingAnnouncement._id}`, payload);
        toast.success('Announcement updated');
      } else {
        await API.post('/announcements', payload);
        toast.success('Announcement published to students');
      }
      setIsModalOpen(false);
      setEditingAnnouncement(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!annToDelete) return;
    try {
      setDeleteLoading(true);
      await API.delete(`/announcements/${annToDelete._id}`);
      toast.success('Announcement deleted');
      setDeleteDialogOpen(false);
      setAnnToDelete(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete announcement');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Updates & Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast test schedules, interview dates, shortlists, and key drive notifications
          </p>
        </div>
        <Button
          onClick={() => {
            if (companies.length === 0) {
              toast.error('Please add a company first before posting updates');
              return;
            }
            setEditingAnnouncement(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 self-start"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Post Update</span>
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={HiOutlineBell}
          title="No Placement Announcements Yet"
          message="Publish updates like test schedules or shortlist releases to keep candidates informed."
          actionLabel="Post Announcement"
          onAction={() => {
            if (companies.length === 0) {
              toast.error('Please add a company first');
              return;
            }
            setEditingAnnouncement(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-indigo-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {item.companyId?.companyName || 'Campus Update'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                {item.jobId?.position && (
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Role: {item.jobId.position}
                  </p>
                )}
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingAnnouncement(item);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Announcement"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setAnnToDelete(item);
                    setDeleteDialogOpen(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Announcement"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        title={editingAnnouncement ? 'Edit Announcement' : 'Post New Announcement'}
      >
        <AnnouncementForm
          announcement={editingAnnouncement}
          companies={companies}
          jobs={jobs}
          onSubmit={handleCreateOrUpdate}
          loading={formLoading}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${annToDelete?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Announcements;

