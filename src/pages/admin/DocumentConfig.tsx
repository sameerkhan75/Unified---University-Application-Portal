import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Edit, Trash2, Plus, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  code: string;
  description: string;
  allowed_formats: string[];
  max_size_mb: number;
  ai_extraction_fields: string[];
  is_required: boolean;
}

interface Program {
  id: string;
  name: string;
  degree: string;
  university: {
    name: string;
  };
}

interface ProgramDocument {
  id: string;
  program_id: string;
  document_type_id: string;
  is_required: boolean;
}

export default function DocumentConfig() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programDocuments, setProgramDocuments] = useState<ProgramDocument[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    allowed_formats: 'pdf,jpg,png',
    max_size_mb: 5,
    ai_extraction_fields: '',
    is_required: true
  });

  useEffect(() => {
    fetchDocumentTypes();
    fetchPrograms();
    fetchProgramDocuments();
  }, []);

  const fetchDocumentTypes = async () => {
    const { data } = await supabase
      .from('document_types')
      .select('*')
      .order('name');
    if (data) setDocumentTypes(data);
  };

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('*, university:universities(name)')
      .order('name');
    if (data) setPrograms(data as any);
  };

  const fetchProgramDocuments = async () => {
    const { data } = await supabase
      .from('program_documents')
      .select('*');
    if (data) setProgramDocuments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docData = {
      name: formData.name,
      code: formData.code.toLowerCase().replace(/\s+/g, '_'),
      description: formData.description,
      allowed_formats: formData.allowed_formats.split(',').map(f => f.trim()),
      max_size_mb: formData.max_size_mb,
      ai_extraction_fields: formData.ai_extraction_fields.split(',').map(f => f.trim()).filter(f => f),
      is_required: formData.is_required
    };

    if (editingDoc) {
      await supabase
        .from('document_types')
        .update(docData)
        .eq('id', editingDoc.id);
    } else {
      await supabase
        .from('document_types')
        .insert(docData);
    }

    setShowModal(false);
    resetForm();
    fetchDocumentTypes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document type?')) {
      await supabase
        .from('document_types')
        .delete()
        .eq('id', id);
      fetchDocumentTypes();
    }
  };

  const handleRequestDocuments = async () => {
    if (!selectedProgram || selectedDocTypes.length === 0) {
      alert('Please select a program and at least one document type');
      return;
    }

    const requests = selectedDocTypes.map(docTypeId => ({
      program_id: selectedProgram,
      document_type_id: docTypeId,
      is_required: true
    }));

    await supabase
      .from('program_documents')
      .insert(requests);

    setShowRequestModal(false);
    setSelectedProgram('');
    setSelectedDocTypes([]);
    fetchProgramDocuments();
    alert('Document requirements added successfully!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      allowed_formats: 'pdf,jpg,png',
      max_size_mb: 5,
      ai_extraction_fields: '',
      is_required: true
    });
    setEditingDoc(null);
  };

  const openEditModal = (doc: DocumentType) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      code: doc.code,
      description: doc.description,
      allowed_formats: doc.allowed_formats.join(','),
      max_size_mb: doc.max_size_mb,
      ai_extraction_fields: doc.ai_extraction_fields.join(','),
      is_required: doc.is_required
    });
    setShowModal(true);
  };

  const getRequiredPrograms = (docTypeId: string) => {
    return programDocuments
      .filter(pd => pd.document_type_id === docTypeId)
      .map(pd => programs.find(p => p.id === pd.program_id))
      .filter(Boolean);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Configuration</h1>
          <p className="text-slate-500">Manage document types and request documents from students</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText size={20} />
            Request Documents
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Document Type
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {documentTypes.map((doc) => {
          const requiredPrograms = getRequiredPrograms(doc.id) as Program[];

          return (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{doc.name}</h3>
                    {doc.is_required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Required
                      </span>
                    )}
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-mono">
                      {doc.code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{doc.description}</p>

                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Upload size={16} />
                      <span>Formats: {doc.allowed_formats.join(', ').toUpperCase()}</span>
                    </div>
                    <div>Max Size: {doc.max_size_mb}MB</div>
                    {doc.ai_extraction_fields.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-600" />
                        <span>AI Extraction Enabled</span>
                      </div>
                    )}
                  </div>

                  {doc.ai_extraction_fields.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">AI Extraction Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {doc.ai_extraction_fields.map((field, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {requiredPrograms.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-700 mb-2">Required for Programs:</p>
                      <div className="flex flex-wrap gap-2">
                        {requiredPrograms.map((prog) => (
                          <span key={prog.id} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded">
                            {prog.university.name} - {prog.degree} {prog.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingDoc ? 'Edit Document Type' : 'Add Document Type'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 10th_marksheet"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Allowed Formats (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allowed_formats}
                    onChange={(e) => setFormData({ ...formData, allowed_formats: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="pdf,jpg,png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Size (MB)
                  </label>
                  <input
                    type="number"
                    value={formData.max_size_mb}
                    onChange={(e) => setFormData({ ...formData, max_size_mb: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  AI Extraction Fields (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.ai_extraction_fields}
                  onChange={(e) => setFormData({ ...formData, ai_extraction_fields: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="student_name,roll_number,marks,grade"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Fields that AI should extract from the document
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_required" className="ml-2 text-sm text-slate-700">
                  This document is required by default
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {editingDoc ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Request Documents from Students</h2>
              <button onClick={() => setShowRequestModal(false)}>
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Program
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose a program...</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.university.name} - {prog.degree} {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Document Types
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4">
                  {documentTypes.map((doc) => (
                    <label key={doc.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDocTypes.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocTypes([...selectedDocTypes, doc.id]);
                          } else {
                            setSelectedDocTypes(selectedDocTypes.filter(id => id !== doc.id));
                          }
                        }}
                        className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-600">{doc.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDocuments}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Request Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    