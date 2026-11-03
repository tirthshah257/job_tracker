import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { HiOutlineClipboardList, HiOutlineBriefcase, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/applications/my');
        setApplications(data.data || []);
      } catch (err) {
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Job Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your recruitment progress, interview shortlists, and placement offers
        </p>
      </div>

      {loading ? (
        <Loader message="Loading your submitted applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={HiOutlineClipboardList}
          title="No Applications Submitted Yet"
          message="You have not submitted an application to any open job positions yet."
          actionLabel="Browse Open Jobs"
          onAction={() => {
            window.location.href = '/student/companies';
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Company</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Position</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Package / CTC</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Applied On</th>
                  <th className="px-6 py-3.5 text-left font-semibold text-gray-700">Current Status</th>
                  <th className="px-6 py-3.5 text-right font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {app.companyId?.logo ? (
                          <img
                            src={`http://localhost:5000/${app.companyId.logo.replace(/\\/g, '/')}`}
                            alt={app.companyId.companyName}
                            className="w-9 h-9 rounded-lg object-contain bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {app.companyId?.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">
                          {app.companyId?.companyName || 'Company'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {app.jobId?.position || 'Position'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-700">
                      {app.jobId?.package || 'Not disclosed'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.companyId?._id && (
                        <Link
                          to={`/student/companies/${app.companyId._id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                        >
                          View Drive →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;

