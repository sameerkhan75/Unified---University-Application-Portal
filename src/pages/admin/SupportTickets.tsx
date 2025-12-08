import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Filter } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    email: string;
  };
  application?: {
    application_number: string;
    university: { name: string };
  };
  assigned_to?: {
    full_name: string;
  };
}

export default function SupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        student:profiles!support_tickets_student_id_fkey(full_name, email),
        application:applications(
          application_number,
          university:universities(name)
        ),
        assigned_to:profiles!support_tickets_assigned_to_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (filterPriority !== 'all') {
      query = query.eq('priority', filterPriority);
    }

    const { data } = await query;
    if (data) setTickets(data as any);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock size={16} />;
      case 'in_progress': return <AlertCircle size={16} />;
      case 'resolved': case 'closed': return <CheckCircle size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-500">Manage and respond to student support requests</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <MessageSquare className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
          <p className="text-sm text-slate-500">Total Tickets</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-3">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
          </p>
          <p className="text-sm text-slate-500">Open/In Progress</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-3">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
          </p>
          <p className="text-sm text-slate-500">High Priority</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.status === 'resolved').length}
          </p>
          <p className="text-sm text-slate-500">Resolved</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                      {ticket.application && (
                        <p className="text-xs text-slate-500 mt-1">
                          {ticket.application.university.name} (#{ticket.application.application_number})
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.student.full_name}</p>
                        <p className="text-xs text-slate-500">{ticket.student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {ticket.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          {ticket.assigned_to.full_name}
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No tickets found
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
