import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, CheckCircle, Upload, FileText } from 'lucide-react';

interface University {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Program {
  id: string;
  name: string;
  degree: string;
  duration_years: number;
  total_fees: number;
  application_fee: number;
  description: string | null;
  eligibility: string | null;
}

interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  max_size_mb: number;
  allowed_formats: string[];
}

export default function CreateApplication() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Indian',
    address: '',
    city: '',
    state: '',
    pincode: '',
    fatherName: '',
    motherName: '',
    emergencyContact: '',
    tenthSchool: '',
    tenthBoard: '',
    tenthYear: '',
    tenthPercentage: '',
    twelfthSchool: '',
    twelfthBoard: '',
    twelfthYear: '',
    twelfthPercentage: '',
    graduationCollege: '',
    graduationUniversity: '',
    graduationDegree: '',
    graduationYear: '',
    graduationPercentage: '',
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: uniData } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .maybeSingle();

      if (uniData) setUniversity(uniData);

      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .eq('university_id', universityId);

      if (programsData) setPrograms(programsData);
    };

    if (universityId) fetchData();
  }, [universityId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedProgram) return;

      const { data } = await supabase
        .from('program_documents')
        .select('document_type:document_types(*)')
        .eq('program_id', selectedProgram);

      if (data) {
        const docs = data.map((d: any) => d.document_type);
        setDocumentTypes(docs);
      }
    };

    fetchDocuments();
  }, [selectedProgram]);

  const handleFileUpload = (docTypeId: string, file: File) => {
    setUploadedDocs(prev => ({ ...prev, [docTypeId]: file }));
  };

  const handleSubmit = async () => {
    if (!selectedProgram || !profile) return;

    setLoading(true);
    try {
      const selectedProgramData = programs.find(p => p.id === selectedProgram);
      if (!selectedProgramData) return;

      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          student_id: profile.id,
          university_id: universityId!,
          program_id: selectedProgram,
          status: 'submitted',
          application_fee: selectedProgramData.application_fee,
          submission_date: new Date().toISOString(),
          tenth_school: formData.tenthSchool,
          tenth_board: formData.tenthBoard,
          tenth_year: parseInt(formData.tenthYear) || null,
          tenth_percentage: parseFloat(formData.tenthPercentage) || null,
          twelfth_school: formData.twelfthSchool,
          twelfth_board: formData.twelfthBoard,
          twelfth_year: parseInt(formData.twelfthYear) || null,
          twelfth_percentage: parseFloat(formData.twelfthPercentage) || null,
          graduation_college: formData.graduationCollege,
          graduation_university: formData.graduationUniversity,
          graduation_degree: formData.graduationDegree,
          graduation_year: parseInt(formData.graduationYear) || null,
          graduation_percentage: parseFloat(formData.graduationPercentage) || null,
        })
        .select()
        .single();

      if (appError) throw appError;

      await supabase.from('profiles').update({
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        emergency_contact: formData.emergencyContact,
      }).eq('id', profile.id);

      for (const [docTypeId, file] of Object.entries(uploadedDocs)) {
        const filePath = `${profile.id}/${application.id}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          await supabase.from('application_documents').insert({
            application_id: application.id,
            document_type_id: docTypeId,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            status: 'pending_verification',
          });
        }
      }

      navigate('/student/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgramSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/student/applications')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{university?.name}</h2>
          <p className="text-slate-500">{university?.city}, {university?.state}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Select Program</h3>
        <div className="space-y-3">
          {programs.map((program) => (
            <div
              key={program.id}
              onClick={() => {
                setSelectedProgram(program.id);
                setStep(2);
              }}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProgram === program.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{program.degree} in {program.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{program.duration_years} years</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Application Fee</p>
                  <p className="text-lg font-bold text-blue-600">₹{program.application_fee.toLocaleString()}</p>
                </div>
              </div>
              {program.description && (
                <p className="text-sm text-slate-600 mt-2">{program.description}</p>
              )}
              {program.eligibility && (
                <div className="mt-2 text-sm text-slate-500">
                  <span className="font-medium">Eligibility:</span> {program.eligibility}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApplicationForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Application Form</h2>
          <p className="text-slate-500">{programs.find(p => p.id === selectedProgram)?.degree} in {programs.find(p => p.id === selectedProgram)?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nationality *</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name *</label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name *</label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Academic History</h3>

        <h4 className="font-medium text-slate-900 mb-3">10th Standard</h4>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label>
            <input
              type="text"
              value={formData.tenthSchool}
              onChange={(e) => setFormData({ ...formData, tenthSchool: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Board *</label>
            <input
              type="text"
              value={formData.tenthBoard}
              onChange={(e) => setFormData({ ...formData, tenthBoard: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year of Passing *</label>
            <input
              type="number"
              value={formData.tenthYear}
              onChange={(e) => setFormData({ ...formData, tenthYear: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Percentage *</label>
            <input
              type="number"
              step="0.01"
              value={formData.tenthPercentage}
              onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <h4 className="font-medium text-slate-900 mb-3">12th Standard</h4>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label>
            <input
              type="text"
              value={formData.twelfthSchool}
              onChange={(e) => setFormData({ ...formData, twelfthSchool: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Board *</label>
            <input
              type="text"
              value={formData.twelfthBoard}
              onChange={(e) => setFormData({ ...formData, twelfthBoard: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year of Passing *</label>
            <input
              type="number"
              value={formData.twelfthYear}
              onChange={(e) => setFormData({ ...formData, twelfthYear: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Percentage *</label>
            <input
              type="number"
              step="0.01"
              value={formData.twelfthPercentage}
              onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <h4 className="font-medium text-slate-900 mb-3">Graduation (if applicable)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College Name</label>
            <input
              type="text"
              value={formData.graduationCollege}
              onChange={(e) => setFormData({ ...formData, graduationCollege: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
            <input
              type="text"
              value={formData.graduationUniversity}
              onChange={(e) => setFormData({ ...formData, graduationUniversity: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
            <input
              type="text"
              value={formData.graduationDegree}
              onChange={(e) => setFormData({ ...formData, graduationDegree: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year of Passing</label>
            <input
              type="number"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Percentage</label>
            <input
              type="number"
              step="0.01"
              value={formData.graduationPercentage}
              onChange={(e) => setFormData({ ...formData, graduationPercentage: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setStep(3)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
          <p className="text-slate-500">Upload required documents for your application</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="space-y-4">
          {documentTypes.map((docType) => (
            <div key={docType.id} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <h4 className="font-medium text-slate-900">
                      {docType.name} {docType.is_required && <span className="text-red-500">*</span>}
                    </h4>
                    <p className="text-sm text-slate-500">{docType.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max size: {docType.max_size_mb}MB | Formats: {docType.allowed_formats.join(', ')}
                    </p>
                  </div>
                </div>
                {uploadedDocs[docType.id] && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
              </div>
              <input
                type="file"
                accept={docType.allowed_formats.map(f => `.${f}`).join(',')}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(docType.id, e.target.files[0])}
                className="w-full text-sm"
              />
              {uploadedDocs[docType.id] && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {uploadedDocs[docType.id].name} ({(uploadedDocs[docType.id].size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setStep(4)}
          className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300"
        >
          Skip for Now
        </button>
        <button
          onClick={() => setStep(4)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const selectedProgramData = programs.find(p => p.id === selectedProgram);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review & Submit</h2>
          <p className="text-slate-500">Review your application before submitting</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">University:</span>
              <span className="font-medium text-slate-900">{university?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Program:</span>
              <span className="font-medium text-slate-900">{selectedProgramData?.degree} in {selectedProgramData?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium text-slate-900">{selectedProgramData?.duration_years} years</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Application Fee:</span>
              <span className="font-medium text-blue-600">₹{selectedProgramData?.application_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Documents Uploaded:</span>
              <span className="font-medium text-slate-900">{Object.keys(uploadedDocs).length} / {documentTypes.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            By submitting this application, you confirm that all information provided is accurate and complete.
            You will be redirected to payment gateway to pay the application fee.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setStep(3)}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Upload size={20} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  s < step ? 'bg-green-500 text-white' : s === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {s < step ? <CheckCircle size={20} /> : s}
                </div>
                {s < 4 && (
                  <div className={`h-1 flex-1 ${s < step ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-600">Select Program</span>
            <span className="text-xs text-slate-600">Application Form</span>
            <span className="text-xs text-slate-600">Upload Documents</span>
            <span className="text-xs text-slate-600">Review & Submit</span>
          </div>
        </div>

        {step === 1 && renderProgramSelection()}
        {step === 2 && renderApplicationForm()}
        {step === 3 && renderDocumentUpload()}
        {step === 4 && renderReview()}
      </div>
    </div>
  );
}
