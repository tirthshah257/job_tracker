import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminMaterials from './pages/admin/Materials';
import AdminApplications from './pages/admin/Applications';
import AdminResults from './pages/admin/Results';
import AdminAnnouncements from './pages/admin/Announcements';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCompanies from './pages/student/Companies';
import CompanyDetail from './pages/student/CompanyDetail';
import MyApplications from './pages/student/MyApplications';
import StudentResults from './pages/student/Results';
import StudentAnnouncements from './pages/student/Announcements';
import Profile from './pages/student/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="companies" element={<StudentCompanies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

