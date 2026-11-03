import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import {
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineBell,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    companiesCount: 0,
    jobsCount: 0,
    openJobsCount: 0,
    materialsCount: 0,
    announcementsCount: 0,
    resultsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [compRes, jobsRes, matRes, annRes, resRes] = await Promise.all([
          API.get('/companies'),
          API.get('/jobs'),
          API.get('/materials'),
          API.get('/announcements'),
          API.get('/results'),
        ]);

        const jobs = jobsRes.data.data || [];
        const openJobs = jobs.filter((j) => j.status === 'Open');

        setStats({
          companiesCount: compRes.data.count || compRes.data.data?.length || 0,
          jobsCount: jobs.length,
          openJobsCount: openJobs.length,
          materialsCount: matRes.data.count || matRes.data.data?.length || 0,
          announcementsCount: annRes.data.count || annRes.data.data?.length || 0,
          resultsCount: resRes.data.count || resRes.data.data?.length || 0,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading dashboard overview..." />;
  }

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.companiesCount,
      icon: HiOutlineOfficeBuilding,
      color: 'bg-indigo-50 text-indigo-600',
      link: '/admin/companies',
    },
    {
      title: 'Active Job Openings',
      value: `${stats.openJobsCount} / ${stats.jobsCount}`,
      subtitle: `${stats.jobsCount} total positions posted`,
      icon: HiOutlineBriefcase,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/admin/jobs',
    },
    {
      title: 'Company Materials',
      value: stats.materialsCount,
      subtitle: 'Uploaded preparation PDFs',
      icon: HiOutlineDocumentText,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/materials',
    },
    {
      title: 'Announcements',
      value: stats.announcementsCount,
      subtitle: 'Updates & schedules posted',
      icon: HiOutlineBell,
      color: 'bg-amber-50 text-amber-600',
      link: '/admin/announcements',
    },
    {
      title: 'Placement Results',
      value: stats.resultsCount,
      subtitle: 'Final selection lists',
      icon: HiOutlineAcademicCap,
      color: 'bg-purple-50 text-purple-600',
      link: '/admin/results',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Placement Cell Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage campus drives, company opportunities, and student placement records.
        </p>
      </div>

      {/* Numerical Overview Cards (No charts/analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/companies"
            className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-medium text-gray-700 hover:text-indigo-700 transition-colors flex items-center gap-2"
          >
            <HiOutlineOfficeBuilding className="w-4 h-4 text-indigo-600" />
            <span>Manage Companies</span>
          </Link>
          <Link
            to="/admin/jobs"
            className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors flex items-center gap-2"
          >
            <HiOutlineBriefcase className="w-4 h-4 text-emerald-600" />
            <span>Add / Edit Jobs</span>
          </Link>
          <Link
            to="/admin/applications"
            className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors flex items-center gap-2"
          >
            <HiOutlineUsers className="w-4 h-4 text-blue-600" />
            <span>Review Applications</span>
          </Link>
          <Link
            to="/admin/announcements"
            className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors flex items-center gap-2"
          >
            <HiOutlineBell className="w-4 h-4 text-amber-600" />
            <span>Post Updates</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
