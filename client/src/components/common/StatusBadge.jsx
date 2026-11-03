const statusColors = {
  Applied: 'bg-blue-100 text-blue-800',
  Shortlisted: 'bg-amber-100 text-amber-800',
  Interview: 'bg-purple-100 text-purple-800',
  Selected: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Open: 'bg-green-100 text-green-800',
  Closed: 'bg-red-100 text-red-800',
  Upcoming: 'bg-blue-100 text-blue-800',
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || 'bg-gray-100 text-gray-800';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
