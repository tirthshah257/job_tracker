import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { HiOutlineUsers, HiOutlineDocumentDownload, HiOutlineBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const Applications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const { data } = await API.get('/jobs');
        const list = data.data || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId(list[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load jobs list');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applications for selected job
  useEffect(() => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoadingApps(true);
        const { data } = await API.get(`/applications/job/${selectedJobId}`);
        setApplications(data.data || []);
      } catch (err) {
        toast.error('Failed to load student applications');
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApplications();
  }, [selectedJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await API.put(`/applications/${appId}`, { status: newStatus });
      toast.success(`Application updated to ${newStatus}`);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = (resumePath) => {
    if (!resumePath) {
      toast.error('No resume uploaded by this student');
      return;
    }
    const cleanPath = resumePath.replace(/\\/g, '/');
    window.open(`http://localhost:5000/${cleanPath}`, '_blank');
  };

  const activeJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review candidates, inspect resumes, and update recruitment pipeline statuses
        </p>
      </div>

      {loadingJobs ? (
        <Loader message="Loading job list..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No Jobs Posted Yet"
          message="Post job opportunities before reviewing student applications."
        />
      ) : (
        <>
          {/* Select Job Dropdown */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Select Job Position:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.companyId?.companyName} — {job.position} ({job.status})
                  </option>
                ))}
              </select>
            </div>

            {activeJob && (
              <div className="text-xs text-gray-500 flex items-center gap-3">
                <span>
                  Package: <strong className="text-gray-800">{activeJob.package || 'N/A'}</strong>
                </span>
                <span>
                  Min CGPA: <strong className="text-gray-800">{activeJob.minimumCGPA ?? '0'}</strong>
                </span>
                <span>
                  Total Applicants: <strong className="text-indigo-600">{applications.length}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Applications Table */}
          {loadingApps ? (
            <Loader message="Loading applicants..." />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={HiOutlineUsers}
              title="No Applications for this Position"
              message="No students have applied to this job yet. Applications will appear here automatically once submitted."
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Student Details</th>
                      <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Academic Info</th>
                      <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Applied On</th>
                      <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Resume</th>
                      <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Pipeline Status</th>
                      <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Change Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => {
                      const student = app.studentId;
                      return (
                        <tr key={app._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{student?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{student?.email}</p>
                            {student?.phone && <p className="text-xs text-gray-400">{student?.phone}</p>}
                          </td>
                          <td className="px-6 py-4 text-xs space-y-0.5">
                            <p className="text-gray-800">
                              Roll: <span className="font-semibold">{student?.enrollmentNumber || 'N/A'}</span>
                            </p>
                            <p className="text-gray-600">
                              {student?.branch || 'N/A'} • Sem {student?.semester || 'N/A'}
                            </p>
                            <p className="text-indigo-600 font-semibold">
                              CGPA: {student?.cgpa ?? 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {student?.resume ? (
                              <button
                                onClick={() => handleDownloadResume(student.resume)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <HiOutlineDocumentDownload className="w-4 h-4" />
                                View Resume
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Not provided</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={app.status}
                              disabled={updatingId === app._id}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applications;

