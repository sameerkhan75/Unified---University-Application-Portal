import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Home, FileText, Settings as SettingsIcon, Upload, Users, CreditCard,
  MessageSquare, HelpCircle, BarChart3, Bell, User, Search,
  CheckCircle, Clock, XCircle, RefreshCw, Building2, DollarSign,
  AlertCircle, TrendingUp, Calendar
} from 'lucide-react';
import ApplicationReview from './ApplicationReview';

function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/applications', icon: FileText, label: 'Applications' },
    { path: '/admin/documents', icon: Upload, label: 'Document Config' },
    { path: '/admin/universities', icon: Building2, label: 'Universities' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/refunds', icon: RefreshCw, label: 'Refunds' },
    { path: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets' },
    { path: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white p-4 fixed h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 p-2">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <SettingsIcon size={24} />
        </div>
        <span className="text-xl font-bold">Admin Portal</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => signOut()}
          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function AdminHeader() {
  const { profile } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search applications, students, tickets..."
          className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardHome() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    revenue: 0,
    openTickets: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: applications } = await supabase
        .from('applications')
        .select('status, application_fee');

      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('status')
        .neq('status', 'closed');

      if (applications) {
        setStats({
          totalApplications: applications.length,
          pendingReview: applications.filter(a => a.status === 'under_review').length,
          approved: applications.filter(a => a.status === 'approved').length,
          rejected: applications.filter(a => a.status === 'rejected').length,
          revenue: applications.reduce((sum, a) => sum + (a.application_fee || 0), 0),
          openTickets: tickets?.length || 0
        });
      }
    };

    const fetchRecentApplications = async () => {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles!applications_student_id_fkey(full_name, email),
          university:universities(name),
          program:programs(name, degree)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setRecentApplications(data);
    };

    fetchStats();
    fetchRecentApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'docs_pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'under_review': return <Clock size={16} />;
      case 'docs_pending': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-orange-100">Manage applications, verify documents, and oversee all operations</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <FileText className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
          <p className="text-sm text-slate-500">Total Applications</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
          <p className="text-sm text-slate-500">Pending Review</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
            <MessageSquare className="text-orange-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.openTickets}</p>
          <p className="text-sm text-slate-500">Open Tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/admin/applications" className="text-orange-600 text-sm font-medium hover:text-orange-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-200">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{app.student?.full_name}</p>
                      <p className="text-sm text-slate-500">{app.student?.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} />
                      {app.university?.name}
                    </span>
                    <span>{app.program?.degree} - {app.program?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No applications yet</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Application Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Approved</span>
                <span className="text-sm font-medium text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Under Review</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingReview}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">{stats.rejected}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Today's Tasks</h3>
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <div>
                  <p className="text-sm text-slate-900">Review pending applications</p>
                  <p className="text-xs text-slate-500">{stats.pendingReview} items</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm text-slate-900">Respond to support tickets</p>
                  <p className="text-xs text-slate-500">{stats.openTickets} open</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationsList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchApplications = async () => {
      let query = supabase
        .from('applications')
        .select(`
          *,
          student:profiles!applications_student_id_fkey(full_name, email),
          university:universities(name),
          program:programs(name, degree)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data } = await query;
      if (data) setApplications(data);
    };

    fetchApplications();
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'docs_pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500">Review and manage all student applications</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="docs_pending">Documents Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{app.application_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{app.student?.full_name}</p>
                        <p className="text-xs text-slate-500">{app.student?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{app.university?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {app.program?.degree} - {app.program?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminHeader />
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/applications" element={<ApplicationsList />} />
          <Route path="/applications/:applicationId" element={<ApplicationReview />} />
          <Route path="/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Document Configuration</h1></div>} />
          <Route path="/universities" element={<div className="p-6"><h1 className="text-2xl font-bold">Universities</h1></div>} />
          <Route path="/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Students</h1></div>} />
          <Route path="/payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments</h1></div>} />
          <Route path="/refunds" element={<div className="p-6"><h1 className="text-2xl font-bold">Refunds</h1></div>} />
          <Route path="/tickets" element={<div className="p-6"><h1 className="text-2xl font-bold">Support Tickets</h1></div>} />
          <Route path="/faqs" element={<div className="p-6"><h1 className="text-2xl font-bold">FAQs</h1></div>} />
          <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1></div>} />
          <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>} />
        </Routes>
      </div>
    </div>
  );
}
