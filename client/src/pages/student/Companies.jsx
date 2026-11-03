import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineOfficeBuilding, HiOutlineSearch, HiOutlineLocationMarker, HiOutlineBriefcase } from 'react-icons/hi';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [compRes, jobsRes] = await Promise.all([
          API.get('/companies'),
          API.get('/jobs'),
        ]);
        setCompanies(compRes.data.data || []);
        setJobs(jobsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCompanyJobs = (companyId) => {
    return jobs.filter((j) => {
      const cId = j.companyId?._id || j.companyId;
      return String(cId) === String(companyId);
    });
  };

  const filteredCompanies = companies.filter((c) =>
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Participating Companies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore companies hiring from campus, review requirements, and apply for open positions
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search company by name or location..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <Loader message="Loading company catalog..." />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={HiOutlineOfficeBuilding}
          title="No Companies Found"
          message={
            searchQuery
              ? `No companies matched "${searchQuery}". Try a different keyword.`
              : 'No recruiting companies have been registered yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((c) => {
            const companyJobs = getCompanyJobs(c._id);
            const openJobs = companyJobs.filter((j) => j.status === 'Open');

            return (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {c.logo ? (
                      <img
                        src={`http://localhost:5000/${c.logo.replace(/\\/g, '/')}`}
                        alt={c.companyName}
                        className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base flex-shrink-0 border border-blue-100">
                        {c.companyName?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                        openJobs.length > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <HiOutlineBriefcase className="w-3.5 h-3.5" />
                      {openJobs.length} {openJobs.length === 1 ? 'Open Position' : 'Open Positions'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-1">{c.companyName}</h3>
                  {c.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-400" />
                      {c.location}
                    </p>
                  )}
                  {c.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                      {c.description}
                    </p>
                  )}

                  {/* List of open jobs under this company */}
                  {companyJobs.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Available Positions:
                      </p>
                      {companyJobs.slice(0, 2).map((j) => (
                        <div key={j._id} className="text-xs flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-800 truncate max-w-[150px]">{j.position}</span>
                          <span className="text-emerald-600 font-semibold">{j.package || j.status}</span>
                        </div>
                      ))}
                      {companyJobs.length > 2 && (
                        <p className="text-xs text-gray-400">+{companyJobs.length - 2} more position(s)</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      No active jobs posted yet
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/student/companies/${c._id}`}
                    className="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    View Details & Apply →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Companies;

