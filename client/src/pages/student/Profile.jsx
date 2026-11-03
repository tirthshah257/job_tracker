import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { HiOutlineUser, HiOutlineDocumentDownload, HiOutlinePencil, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const BRANCH_OPTIONS = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AI/ML', 'Other'];

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch: 'CSE',
    semester: 6,
    graduationYear: 2026,
    cgpa: 8.0,
  });
  const [newResume, setNewResume] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/auth/profile');
      const u = data.user || data;
      setProfile(u);
      setFormData({
        name: u.name || '',
        phone: u.phone || '',
        branch: u.branch || 'CSE',
        semester: u.semester || 6,
        graduationYear: u.graduationYear || 2026,
        cgpa: u.cgpa ?? 8.0,
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Resume must be a PDF');
        e.target.value = '';
        return;
      }
      setNewResume(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('branch', formData.branch);
      data.append('semester', formData.semester);
      data.append('graduationYear', formData.graduationYear);
      data.append('cgpa', formData.cgpa);
      if (newResume) {
        data.append('resume', newResume);
      }

      await API.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile updated successfully');
      setEditMode(false);
      setNewResume(null);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleViewResume = () => {
    if (!profile?.resume) {
      toast.error('No resume uploaded yet');
      return;
    }
    const cleanPath = profile.resume.replace(/\\/g, '/');
    window.open(`http://localhost:5000/${cleanPath}`, '_blank');
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep your academic details and resume up to date for campus recruiters
          </p>
        </div>
        {!editMode ? (
          <Button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setEditMode(false);
              setNewResume(null);
            }}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Roll No: {profile?.enrollmentNumber || 'Not provided'}
            </span>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  required
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                type="number"
                min="2020"
                max="2035"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload New Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {newResume && (
                <p className="text-xs text-blue-600 mt-1">Selected new resume: {newResume.name}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-gray-400 block text-xs mb-1">Phone Number</span>
                <p className="font-semibold text-gray-800">{profile?.phone || 'Not provided'}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Branch</span>
                <p className="font-semibold text-gray-800">{profile?.branch || 'Not provided'}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Current Semester</span>
                <p className="font-semibold text-gray-800">
                  {profile?.semester ? `Semester ${profile.semester}` : 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Graduation Year</span>
                <p className="font-semibold text-gray-800">{profile?.graduationYear || 'Not provided'}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Cumulative GPA (CGPA)</span>
                <p className="font-bold text-blue-600 text-base">{profile?.cgpa ?? 'Not provided'}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-xs mb-1">Uploaded Resume</span>
                {profile?.resume ? (
                  <button
                    onClick={handleViewResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors mt-0.5"
                  >
                    <HiOutlineDocumentDownload className="w-4 h-4" />
                    Download / View Current Resume
                  </button>
                ) : (
                  <p className="text-gray-400 text-xs">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

