import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import {
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineBell,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const StudentDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [compRes, jobsRes, appsRes, annRes] = await Promise.all([
          API.get('/companies'),
          API.get('/jobs?status=Open'),
          API.get('/applications/my'),
          API.get('/announcements'),
        ]);

        setCompanies((compRes.data.data || []).slice(0, 5));
        setOpenJobs((jobsRes.data.data || []).slice(0, 5));
        setMyApplications((appsRes.data.data || []).slice(0, 5));
        setAnnouncements((annRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Loading your placement dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campus Placement Portal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore recruiting companies, apply for open positions, and track your application status.
        </p>
      </div>

      {/* Grid of 4 Key Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Open Job Opportunities */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <HiOutlineBriefcase className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-gray-900">Open Job Opportunities</h2>
              </div>
              <Link
                to="/student/companies"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {openJobs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No open jobs at the moment.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {openJobs.map((job) => {
                  const companyId = job.companyId?._id || job.companyId;
                  return (
                    <div key={job._id} className="py-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{job.position}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          {job.companyId?.companyName || 'Company'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-gray-800">{job.package || 'Competitive'}</p>
                          <p className="text-xs text-gray-400">
                            Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                          </p>
                        </div>
                        {companyId && (
                          <Link
                            to={`/student/companies/${companyId}`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                          >
                            Apply Now
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: My Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <HiOutlineClipboardList className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-gray-900">My Recent Applications</h2>
              </div>
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 mb-2">You haven't applied for any jobs yet.</p>
                <Link
                  to="/student/companies"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Browse companies to apply
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myApplications.map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {app.jobId?.position || 'Position'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.companyId?.companyName || 'Company'}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={app.status} />
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Available Companies */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <HiOutlineOfficeBuilding className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-gray-900">Available Companies</h2>
              </div>
              <Link
                to="/student/companies"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {companies.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No companies available yet.</p>
            ) : (
              <div className="space-y-3">
                {companies.map((c) => (
                  <Link
                    key={c._id}
                    to={`/student/companies/${c._id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {c.logo ? (
                        <img
                          src={`http://localhost:5000/${c.logo.replace(/\\/g, '/')}`}
                          alt={c.companyName}
                          className="w-8 h-8 rounded-md object-contain bg-gray-50 p-0.5 border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {c.companyName?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.companyName}</p>
                        <p className="text-xs text-gray-400">{c.location || 'Campus Drive'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-600">Details & Jobs →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Latest Placement Updates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <HiOutlineBell className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-gray-900">Latest Placement Updates</h2>
              </div>
              <Link
                to="/student/announcements"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No recent announcements.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {announcements.map((ann) => (
                  <div key={ann._id} className="py-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span className="font-semibold text-indigo-600">
                        {ann.companyId?.companyName || 'General Update'}
                      </span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

