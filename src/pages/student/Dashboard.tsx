import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Home, FileText, Upload, CreditCard, MessageSquare, HelpCircle, GraduationCap, Bell, User, Plus, ChevronRight } from 'lucide-react';
import CreateApplication from './CreateApplication';
import Support from './Support';
import TicketView from '../TicketView';

function StudentSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: '/student', icon: Home, label: 'Dashboard' },
    { path: '/student/applications', icon: FileText, label: 'My Applications' },
    { path: '/student/documents', icon: Upload, label: 'My Documents' },
    { path: '/student/payments', icon: CreditCard, label: 'Payments' },
    { path: '/student/support', icon: MessageSquare, label: 'Support' },
    { path: '/student/faqs', icon: HelpCircle, label: 'FAQs' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white p-4 fixed h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 p-2">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <GraduationCap size={24} />
        </div>
        <span className="text-xl font-bold">UniApply</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-2">Need Help?</p>
          <p className="text-xs text-slate-500 mb-3">Contact our support team</p>
          <button
            onClick={() => signOut()}
            className="w-full bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentHeader() {
  const { profile } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search applications, universities..."
          className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardHome() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, docsPending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('student_id', profile?.id || '');

      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(a => a.status === 'under_review').length,
          approved: data.filter(a => a.status === 'approved').length,
          docsPending: data.filter(a => a.status === 'docs_pending').length,
        });
      }
    };

    fetchStats();
  }, [profile?.id]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
        <p className="text-blue-100 mb-4">Track your applications and manage your documents all in one place.</p>
        <Link
          to="/student/applications"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50"
        >
          <Plus size={20} /> New Application
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <FileText className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Applications</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          <p className="text-sm text-slate-500">Under Review</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.docsPending}</p>
          <p className="text-sm text-slate-500">Documents Pending</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
          <p className="text-sm text-slate-500">Approved</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
          <Link to="/student/applications" className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View All →
          </Link>
        </div>
        <div className="p-4 text-center text-slate-500">
          No applications yet. Create your first application!
        </div>
      </div>
    </div>
  );
}

function Applications() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [universities, setUniversities] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase
        .from('universities')
        .select('*, programs(*)');
      if (data) setUniversities(data);
    };

    const fetchMyApplications = async () => {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          university:universities(name),
          program:programs(name, degree)
        `)
        .eq('student_id', profile?.id || '')
        .order('created_at', { ascending: false });

      if (data) setMyApplications(data);
    };

    fetchUniversities();
    fetchMyApplications();
  }, [profile?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'docs_pending': return 'bg-orange-100 text-orange-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500">Manage and track all your university applications</p>
        </div>
      </div>

      {myApplications.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Your Applications</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {myApplications.map((app) => (
              <div key={app.id} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{app.university?.name}</p>
                    <p className="text-sm text-slate-600">{app.program?.degree} - {app.program?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Application #{app.application_number}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Application</h2>
        <p className="text-slate-500 mb-6">Select a university to start your application</p>

        <div className="space-y-3">
          {universities.map((uni) => (
            <div
              key={uni.id}
              onClick={() => navigate(`/student/applications/create/${uni.id}`)}
              className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-slate-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{uni.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{uni.city}</span>
                      <span>{uni.programs?.length || 0} Programs</span>
                      <span>Rank #{uni.rank}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-slate-400" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />
      <div className="flex-1 ml-64">
        <StudentHeader />
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/create/:universityId" element={<CreateApplication />} />
          <Route path="documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents</h1></div>} />
          <Route path="payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments</h1></div>} />
          <Route path="support" element={<Support />} />
          <Route path="support/:ticketId" element={<TicketView />} />
          <Route path="faqs" element={<div className="p-6"><h1 className="text-2xl font-bold">FAQs</h1></div>} />
        </Routes>
      </div>
    </div>
  );
}
