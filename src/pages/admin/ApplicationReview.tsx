import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText,
  User, GraduationCap, Calendar, Clock, Save, X
} from 'lucide-react';

interface Application {
  id: string;
  application_number: string;
  status: string;
  submission_date: string;
  tenth_school: string | null;
  tenth_board: string | null;
  tenth_year: number | null;
  tenth_percentage: number | null;
  twelfth_school: string | null;
  twelfth_board: string | null;
  twelfth_year: number | null;
  twelfth_percentage: number | null;
  graduation_college: string | null;
  graduation_university: string | null;
  graduation_degree: string | null;
  graduation_year: number | null;
  graduation_percentage: number | null;
  admin_notes: string | null;
  student: {
    full_name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    father_name: string | null;
    mother_name: string | null;
  };
  university: {
    name: string;
  };
  program: {
    name: string;
    degree: string;
  };
}

interface Document {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  status: string;
  uploaded_at: string;
  verified_at: string | null;
  admin_notes: string | null;
  document_type: {
    name: string;
    description: string | null;
  };
}

export default function ApplicationReview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      const { data: appData } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles!applications_student_id_fkey(
            full_name, email, phone, date_of_birth, gender,
            address, city, state, pincode, father_name, mother_name
          ),
          university:universities(name),
          program:programs(name, degree)
        `)
        .eq('id', applicationId)
        .maybeSingle();

      if (appData) {
        setApplication(appData as any);
        setNewStatus(appData.status);
        setAdminNotes(appData.admin_notes || '');
      }

      const { data: docsData } = await supabase
        .from('application_documents')
        .select(`
          *,
          document_type:document_types(name, description)
        `)
        .eq('application_id', applicationId);

      if (docsData) setDocuments(docsData as any);

      setLoading(false);
    };

    if (applicationId) fetchApplication();
  }, [applicationId]);

  const handleUpdateStatus = async () => {
    if (!applicationId) return;

    setSaving(true);
    try {
      await supabase
        .from('applications')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      alert('Application status updated successfully');
      navigate('/admin/applications');
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application');
    } finally {
      setSaving(false);
    }
  };

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docRejectionNote, setDocRejectionNote] = useState('');

  const handleVerifyDocument = async (docId: string, status: 'verified' | 'rejected', note?: string) => {
    await supabase
      .from('application_documents')
      .update({
        status,
        verified_at: new Date().toISOString(),
        admin_notes: note || null,
      })
      .eq('id', docId);

    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? { ...doc, status, verified_at: new Date().toISOString(), admin_notes: note || null }
          : doc
      )
    );

    setDocModalOpen(false);
    setSelectedDoc(null);
    setDocRejectionNote('');
  };

  const openRejectModal = (docId: string) => {
    setSelectedDoc(docId);
    setDocModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Application not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'verified': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'docs_pending': case 'pending_verification': return 'bg-orange-100 text-orange-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDocStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected': return <XCircle className="text-red-600" size={20} />;
      default: return <Clock className="text-orange-600" size={20} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/applications')}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Application</h1>
          <p className="text-slate-500">Application #{application.application_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Student Information</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="font-medium text-slate-900">{application.student.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{application.student.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-900">{application.student.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date of Birth</p>
                <p className="font-medium text-slate-900">
                  {application.student.date_of_birth
                    ? new Date(application.student.date_of_birth).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Gender</p>
                <p className="font-medium text-slate-900">{application.student.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">City, State</p>
                <p className="font-medium text-slate-900">
                  {application.student.city}, {application.student.state}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium text-slate-900">{application.student.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Father's Name</p>
                <p className="font-medium text-slate-900">{application.student.father_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Mother's Name</p>
                <p className="font-medium text-slate-900">{application.student.mother_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Program Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">University</p>
                <p className="font-medium text-slate-900">{application.university.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Program</p>
                <p className="font-medium text-slate-900">
                  {application.program.degree} in {application.program.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Submission Date</p>
                <p className="font-medium text-slate-900">
                  {new Date(application.submission_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Academic History</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-900 mb-2">10th Standard</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">School</p>
                    <p className="text-slate-900">{application.tenth_school || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Board</p>
                    <p className="text-slate-900">{application.tenth_board || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Year</p>
                    <p className="text-slate-900">{application.tenth_year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Percentage</p>
                    <p className="text-slate-900">{application.tenth_percentage ? `${application.tenth_percentage}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-slate-900 mb-2">12th Standard</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">School</p>
                    <p className="text-slate-900">{application.twelfth_school || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Board</p>
                    <p className="text-slate-900">{application.twelfth_board || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Year</p>
                    <p className="text-slate-900">{application.twelfth_year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Percentage</p>
                    <p className="text-slate-900">{application.twelfth_percentage ? `${application.twelfth_percentage}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {application.graduation_college && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Graduation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">College</p>
                      <p className="text-slate-900">{application.graduation_college}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">University</p>
                      <p className="text-slate-900">{application.graduation_university || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Degree</p>
                      <p className="text-slate-900">{application.graduation_degree || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Year</p>
                      <p className="text-slate-900">{application.graduation_year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Percentage</p>
                      <p className="text-slate-900">{application.graduation_percentage ? `${application.graduation_percentage}%` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Uploaded Documents</h2>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" size={24} />
                        <div>
                          <p className="font-medium text-slate-900">{doc.document_type.name}</p>
                          <p className="text-sm text-slate-500">{doc.file_name}</p>
                          <p className="text-xs text-slate-400">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded{' '}
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDocStatusIcon(doc.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {doc.admin_notes && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <p className="font-medium text-red-700">Admin Note:</p>
                        <p className="text-red-600">{doc.admin_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Document
                      </a>
                      {doc.status === 'pending_verification' && (
                        <>
                          <button
                            onClick={() => handleVerifyDocument(doc.id, 'verified')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => openRejectModal(doc.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No documents uploaded yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Update Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Application Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="docs_pending">Documents Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Add notes about this application..."
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-2">Document Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Verified:</span>
                  <span className="font-medium text-green-600">
                    {documents.filter(d => d.status === 'verified').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending:</span>
                  <span className="font-medium text-orange-600">
                    {documents.filter(d => d.status === 'pending_verification').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rejected:</span>
                  <span className="font-medium text-red-600">
                    {documents.filter(d => d.status === 'rejected').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {docModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Reject Document</h2>
              <button
                onClick={() => {
                  setDocModalOpen(false);
                  setSelectedDoc(null);
                  setDocRejectionNote('');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={docRejectionNote}
                  onChange={(e) => setDocRejectionNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Explain why this document is being rejected..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDocModalOpen(false);
                    setSelectedDoc(null);
                    setDocRejectionNote('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedDoc && handleVerifyDocument(selectedDoc, 'rejected', docRejectionNote)}
                  disabled={!docRejectionNote.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
