import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, User as UserIcon, Clock, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  application?: {
    application_number: string;
    university: { name: string };
  };
  assigned_to?: {
    id: string;
    full_name: string;
  };
}

export default function TicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchTicket();
    fetchMessages();
    if (isAdmin) fetchAdmins();

    const subscription = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ticketId, isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select(`
        *,
        student:profiles!support_tickets_student_id_fkey(id, full_name, email),
        application:applications(
          application_number,
          university:universities(name)
        ),
        assigned_to:profiles!support_tickets_assigned_to_fkey(id, full_name)
      `)
      .eq('id', ticketId)
      .maybeSingle();

    if (data) setTicket(data as any);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('ticket_messages')
      .select(`
        *,
        sender:profiles(id, full_name, role)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as any);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'admin');

    if (data) setAdmins(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: profile?.id,
          message: newMessage,
          is_internal: false
        });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    await supabase
      .from('support_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    fetchTicket();
  };

  const handleAssignTicket = async (adminId: string) => {
    await supabase
      .from('support_tickets')
      .update({
        assigned_to: adminId || null,
        status: adminId ? 'in_progress' : 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    fetchTicket();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Ticket not found</p>
      </div>
    );
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isAdmin ? '/admin/tickets' : '/student/support')}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ticket #{ticket.ticket_number}</h1>
          <p className="text-slate-500">{ticket.subject}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender.id === profile?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isOwnMessage && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                            <UserIcon size={14} className="text-slate-600" />
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          {message.sender.full_name}
                          {message.sender.role === 'admin' && ' (Admin)'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={20} />
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ticket Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Student</p>
                <p className="font-medium text-slate-900">{ticket.student.full_name}</p>
                <p className="text-xs text-slate-500">{ticket.student.email}</p>
              </div>

              {ticket.application && (
                <div>
                  <p className="text-sm text-slate-500">Related Application</p>
                  <p className="font-medium text-slate-900">{ticket.application.university.name}</p>
                  <p className="text-xs text-slate-500">#{ticket.application.application_number}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">Created</p>
                <p className="text-sm text-slate-900">
                  {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                  {new Date(ticket.created_at).toLocaleTimeString()}
                </p>
              </div>

              {ticket.assigned_to && (
                <div>
                  <p className="text-sm text-slate-500">Assigned To</p>
                  <p className="font-medium text-slate-900">{ticket.assigned_to.full_name}</p>
                </div>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Actions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={ticket.assigned_to?.id || ''}
                    onChange={(e) => handleAssignTicket(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
