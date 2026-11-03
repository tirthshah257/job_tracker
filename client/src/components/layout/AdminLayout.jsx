import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: HiOutlineHome, end: true },
  { name: 'Companies', path: '/admin/companies', icon: HiOutlineOfficeBuilding },
  { name: 'Jobs', path: '/admin/jobs', icon: HiOutlineBriefcase },
  { name: 'Materials', path: '/admin/materials', icon: HiOutlineDocumentText },
  { name: 'Applications', path: '/admin/applications', icon: HiOutlineUsers },
  { name: 'Placement Results', path: '/admin/results', icon: HiOutlineAcademicCap },
  { name: 'Announcements', path: '/admin/announcements', icon: HiOutlineBell },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            JT
          </div>
          <span className="font-bold text-gray-800">Admin Portal</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-md focus:outline-none"
        >
          {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col justify-between`}
      >
        <div>
          {/* Logo / Brand */}
          <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              JT
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Job Tracker</h1>
              <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 items-center justify-between">
          <div className="text-sm text-gray-500 font-medium">
            Welcome back, <span className="text-gray-800 font-semibold">{user?.name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Administrator
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
