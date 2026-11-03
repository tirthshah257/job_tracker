import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import {
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineArrowLeft,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineBell,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const CompanyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [compRes, jobsRes, matRes, annRes, myAppsRes] = await Promise.all([
        API.get(`/companies/${id}`),
        API.get(`/jobs?company=${id}`),
        API.get(`/materials?company=${id}`),
        API.get(`/announcements?company=${id}`),
        API.get('/applications/my'),
      ]);

      const compData = compRes.data.data;
      setCompany(compData);
      const jobsList =
        jobsRes.data.data && jobsRes.data.data.length > 0
          ? jobsRes.data.data
          : compData?.jobs || [];
      setJobs(jobsList);
      setMaterials(matRes.data.data || []);
      setAnnouncements(annRes.data.data || []);
      setMyApplications(myAppsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const handleApply = async (job) => {
    // 1. Check job status
    if (job.status !== 'Open') {
      toast.error('This job is currently not accepting applications');
      return;
    }

    // 2. Check deadline (end of deadline day)
    if (job.deadline) {
      const deadlineEnd = new Date(job.deadline);
      deadlineEnd.setHours(23, 59, 59, 999);
      if (deadlineEnd < new Date()) {
        toast.error('The application deadline for this position has passed');
        return;
      }
    }

    // 3. Check CGPA
    const studentCGPA = user?.cgpa || 0;
    if (job.minimumCGPA && studentCGPA < job.minimumCGPA) {
      toast.error(`Minimum CGPA requirement is ${job.minimumCGPA}. Your CGPA is ${studentCGPA}.`);
      return;
    }

    // 4. Check eligible branch
    if (job.eligibleBranches && job.eligibleBranches.length > 0 && user?.branch) {
      if (!job.eligibleBranches.includes(user.branch)) {
        toast.error(`Your branch (${user.branch}) is not eligible for this job.`);
        return;
      }
    }

    try {
      setApplyingJobId(job._id);
      await API.post('/applications', { jobId: job._id });
      toast.success(`Successfully applied for ${job.position}!`);
      // Refresh my applications
      const { data } = await API.get('/applications/my');
      setMyApplications(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleDownloadMaterial = async (mat) => {
    try {
      const response = await API.get(`/materials/download/${mat._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${mat.title || 'material'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download PDF document');
    }
  };

  // Check if student applied to a specific job
  const hasApplied = (jobId) => {
    return myApplications.some((app) => {
      const jId = app.jobId?._id || app.jobId;
      return jId === jobId;
    });
  };

  if (loading) {
    return <Loader message="Loading company profile and job opportunities..." />;
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Company not found.</p>
        <Link to="/student/companies" className="text-blue-600 font-semibold underline">
          Back to companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to="/student/companies"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to all companies
      </Link>

      {/* Company Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {company.logo ? (
            <img
              src={`http://localhost:5000/${company.logo.replace(/\\/g, '/')}`}
              alt={company.companyName}
              className="w-20 h-20 rounded-2xl object-contain bg-gray-50 p-2 border border-gray-100 flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl flex-shrink-0 border border-blue-100">
              {company.companyName?.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{company.companyName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              {company.location && (
                <span className="flex items-center gap-1">
                  <HiOutlineLocationMarker className="w-4 h-4 text-gray-400" />
                  {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <HiOutlineGlobeAlt className="w-4 h-4 text-blue-500" />
                  Official Website
                </a>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
            {company.description}
          </div>
        )}
      </div>

      {/* Section 1: Job Positions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HiOutlineBriefcase className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Job Positions ({jobs.length})</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
            No active positions posted for {company.companyName} yet.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const applied = hasApplied(job._id);
              const isClosed = job.status === 'Closed';
              const isUpcoming = job.status === 'Upcoming';
              const isDeadlinePassed = Boolean(
                job.deadline &&
                new Date(new Date(job.deadline).setHours(23, 59, 59, 999)) < new Date()
              );
              const cgpaIneligible = job.minimumCGPA && (user?.cgpa || 0) < job.minimumCGPA;
              const branchIneligible =
                job.eligibleBranches &&
                job.eligibleBranches.length > 0 &&
                user?.branch &&
                !job.eligibleBranches.includes(user.branch);

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{job.position}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 mt-1">
                        Package: {job.package || 'Not disclosed'}
                      </p>
                    </div>

                    {/* Prominent Smart Apply Button */}
                    <div>
                      {applied ? (
                        <Button
                          disabled
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                        >
                          <HiOutlineCheck className="w-4 h-4 mr-1.5" />
                          Applied
                        </Button>
                      ) : isClosed ? (
                        <Button
                          disabled
                          variant="outline"
                          className="bg-gray-100 text-gray-500 border-gray-300 font-medium"
                        >
                          Applications Closed
                        </Button>
                      ) : isDeadlinePassed ? (
                        <Button
                          disabled
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200 font-medium"
                        >
                          Deadline Expired
                        </Button>
                      ) : isUpcoming ? (
                        <Button
                          disabled
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200 font-medium"
                        >
                          Upcoming Drive
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleApply(job)}
                          loading={applyingJobId === job._id}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-6 py-2.5"
                        >
                          Apply for Job
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Eligibility & Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Minimum CGPA Required:</span>
                      <span
                        className={`font-semibold ${
                          cgpaIneligible ? 'text-red-600' : 'text-gray-800'
                        }`}
                      >
                        {job.minimumCGPA ?? '0.0'} (Your CGPA: {user?.cgpa ?? 'N/A'})
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Eligible Branches:</span>
                      <span
                        className={`font-semibold ${
                          branchIneligible ? 'text-red-600' : 'text-gray-800'
                        }`}
                      >
                        {job.eligibleBranches?.length > 0
                          ? job.eligibleBranches.join(', ')
                          : 'All Branches'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Deadline:</span>
                      <span className="font-semibold text-gray-800">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                      </span>
                    </div>
                  </div>

                  {/* Ineligibility Warning Messages */}
                  {!applied && !isClosed && !isDeadlinePassed && (
                    <>
                      {cgpaIneligible && (
                        <p className="text-xs text-red-600 font-medium">
                          ⚠️ You do not meet the minimum CGPA requirement ({job.minimumCGPA}) for this role.
                        </p>
                      )}
                      {branchIneligible && (
                        <p className="text-xs text-red-600 font-medium">
                          ⚠️ Your branch ({user?.branch}) is not listed under eligible branches for this role.
                        </p>
                      )}
                    </>
                  )}

                  {/* Skills */}
                  {job.requiredSkills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process & Description */}
                  {job.recruitmentProcess && (
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-800 block mb-1">
                        Recruitment Process:
                      </span>
                      <p className="whitespace-pre-wrap">{job.recruitmentProcess}</p>
                    </div>
                  )}

                  {job.description && (
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <span className="font-semibold text-gray-800 block mb-1">Role Description:</span>
                      <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Preparation Materials (PDFs) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Preparation Materials & Guidelines ({materials.length})
          </h2>
        </div>

        {materials.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No preparation documents uploaded for {company.companyName} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materials.map((mat) => (
              <div
                key={mat._id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-blue-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-red-100">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-sm text-gray-900 truncate">{mat.title}</p>
                    {mat.description && (
                      <p className="text-xs text-gray-500 truncate">{mat.description}</p>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(mat.uploadedAt || mat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadMaterial(mat)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Announcements & Updates */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HiOutlineBell className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Company Announcements ({announcements.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-amber-800">
                  <span className="font-semibold">{ann.title}</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;

