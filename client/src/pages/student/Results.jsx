import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/results');
        setResults(data.data || []);
      } catch (err) {
        toast.error('Failed to load placement results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Placement Selections & Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          Final selection lists published by the college placement committee
        </p>
      </div>

      {loading ? (
        <Loader message="Loading published placement results..." />
      ) : results.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No Placement Results Published Yet"
          message="Final selection results will appear here once published by the placement cell."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {res.companyId?.companyName || 'Company'}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600">
                      {res.jobId?.position || 'Position'}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Official Result
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Selected Candidates ({res.selectedStudents?.length || 0})
                  </p>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {res.selectedStudents?.map((student, sIdx) => (
                      <div key={student._id || sIdx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-gray-400">
                            Roll: {student.enrollmentNumber || 'N/A'} • {student.branch || 'Student'}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                          Selected
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Published by Placement Cell</span>
                <span>
                  {res.publishedAt
                    ? new Date(res.publishedAt).toLocaleDateString()
                    : new Date(res.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
