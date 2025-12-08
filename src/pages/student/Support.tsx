import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  application?: {
    application_number: string;
    university: { name: string };
  };
}

export default function Support() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    application_id: '',
    message: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchApplications();
  }, [profile?.id]);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select(`
        *,
        application:applications(
          application_number,
          university:universities(name)
        )
      `)
      .eq('student_id', profile?.id || '')
      .order('created_at', { ascending: false });

    if (data) setTickets(data as any);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('id, application_number, university:universities(name)')
      .eq('student_id', profile?.id || '');

    if (data) setApplications(data);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const ticketNumber = `TKT${Date.now().toString().slice(-8)}`;

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          student_id: profile?.id,
          application_id: formData.application_id || null,
          subject: formData.subject,
          priority: formData.priority,
          status: 'open'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: profile?.id,
          message: formData.message,
          is_internal: false
        });

      setShowCreateModal(false);
      setFormData({ subject: '', priority: 'medium', application_id: '', message: '' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setCreating(false);
    }
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <p className="text-slate-500">Get help with your applications and documents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Ticket
        </button>
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
          <p className="text-sm text-slate-500">Open</p>
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
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
            <MessageSquare className="text-slate-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.status === 'closed').length}
          </p>
          <p className="text-sm text-slate-500">Closed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Your Tickets</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/student/support/${ticket.id}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{ticket.subject}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Ticket #{ticket.ticket_number}</p>
                    {ticket.application && (
                      <p className="text-xs text-slate-400 mt-1">
                        Related to: {ticket.application.university.name} (#{ticket.application.application_number})
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Created {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                  {new Date(ticket.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="mx-auto mb-3 text-slate-300" size={48} />
              <p>No support tickets yet</p>
              <p className="text-sm mt-1">Click "New Ticket" to get help</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Create Support Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Related Application (Optional)
                </label>
                <select
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.university.name} - #{app.application_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
