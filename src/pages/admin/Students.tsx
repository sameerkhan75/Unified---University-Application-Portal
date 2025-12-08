import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, MapPin, Calendar, FileText, MessageSquare, Search } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  father_name: string;
  mother_name: string;
  emergency_contact: string;
  created_at: string;
}

interface Application {
  id: string;
  application_number: string;
  status: string;
  created_at: string;
  university: { name: string };
  program: { name: string; degree: string };
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    if (data) setStudents(data);
  };

  const fetchStudentDetails = async (studentId: string) => {
    const { data: appsData } = await supabase
      .from('applications')
      .select(`
        *,
        university:universities(name),
        program:programs(name, degree)
      `)
      .eq('student_id', studentId);

    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('student_id', studentId);

    if (appsData) setApplications(appsData as any);
    if (ticketsData) setTickets(ticketsData);
  };

  const handleViewDetails = async (student: Student) => {
    setSelectedStudent(student);
    await fetchStudentDetails(student.id);
    setShowDetails(true);
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500">View and manage all registered students</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <User className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{students.length}</p>
          <p className="text-sm text-slate-500">Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <FileText className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {students.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </p>
          <p className="text-sm text-slate-500">New This Month</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
            <Mail className="text-orange-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {students.filter(s => s.email).length}
          </p>
          <p className="text-sm text-slate-500">Verified Emails</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <Phone className="text-purple-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {students.filter(s => s.phone).length}
          </p>
          <p className="text-sm text-slate-500">With Phone Numbers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nationality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {student.phone && (
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone size={14} />
                            {student.phone}
                          </p>
                        )}
                        {student.emergency_contact && (
                          <p className="text-xs text-slate-500">
                            Emergency: {student.emergency_contact}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.city && student.state ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {student.city}, {student.state}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.gender || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.nationality || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Student Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Personal Information</h3>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500">Full Name</p>
                      <p className="text-sm font-medium text-slate-900">{selectedStudent.full_name}</p>
                    </div>
                    {selectedStudent.date_of_birth && (
                      <div>
                        <p className="text-xs text-slate-500">Date of Birth</p>
                        <p className="text-sm text-slate-900 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(selectedStudent.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Gender</p>
                        <p className="text-sm text-slate-900">{selectedStudent.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Nationality</p>
                        <p className="text-sm text-slate-900">{selectedStudent.nationality || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Family Details</h3>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500">Father's Name</p>
                      <p className="text-sm text-slate-900">{selectedStudent.father_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Mother's Name</p>
                      <p className="text-sm text-slate-900">{selectedStudent.mother_name || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Contact Information</h3>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-900 flex items-center gap-1">
                        <Mail size={14} />
                        {selectedStudent.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm text-slate-900 flex items-center gap-1">
                        <Phone size={14} />
                        {selectedStudent.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Emergency Contact</p>
                      <p className="text-sm text-slate-900">{selectedStudent.emergency_contact || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Address</h3>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-900">
                      {selectedStudent.address || 'Not provided'}
                    </p>
                    {selectedStudent.city && (
                      <p className="text-sm text-slate-600 mt-2">
                        {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Applications ({applications.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-slate-900">{app.university.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{app.program.degree} - {app.program.name}</p>
                        <p className="text-xs text-slate-500 mt-1">#{app.application_number}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No applications yet</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Support Tickets ({tickets.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">#{ticket.ticket_number}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Priority: {ticket.priority} • {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">No support tickets</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
