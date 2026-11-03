import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineBell } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/announcements');
        setAnnouncements(data.data || []);
      } catch (err) {
        toast.error('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Placement Cell Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stay informed on upcoming drive dates, aptitude tests, interview rounds, and process updates
        </p>
      </div>

      {loading ? (
        <Loader message="Loading announcements..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={HiOutlineBell}
          title="No Placement Announcements Yet"
          message="Updates from the placement cell will be posted here."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {ann.companyId?.companyName || 'General Placement Update'}
                  </span>
                  {ann.jobId?.position && (
                    <span className="text-xs text-gray-500">
                      • Position: <strong className="text-gray-700">{ann.jobId.position}</strong>
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-2">{ann.title}</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {ann.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;

