import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, MapPin, Star, ExternalLink, Plus, Edit, Trash2, X, GraduationCap } from 'lucide-react';

interface University {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  code: string;
  rank: number;
  description: string;
  website: string;
  created_at: string;
}

interface Program {
  id: string;
  name: string;
  degree: string;
  department: string;
  duration_years: number;
  application_fee: number;
  total_fees: number;
}

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<{ [key: string]: Program[] }>({});
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    state: '',
    code: '',
    rank: 0,
    description: '',
    website: ''
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select('*')
      .order('rank', { ascending: true });
    if (data) {
      setUniversities(data);
      data.forEach(uni => fetchPrograms(uni.id));
    }
  };

  const fetchPrograms = async (universityId: string) => {
    const { data } = await supabase
      .from('programs')
      .select('*')
      .eq('university_id', universityId);
    if (data) {
      setPrograms(prev => ({ ...prev, [universityId]: data }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUniversity) {
      await supabase
        .from('universities')
        .update(formData)
        .eq('id', editingUniversity.id);
    } else {
      await supabase
        .from('universities')
        .insert(formData);
    }

    setShowModal(false);
    resetForm();
    fetchUniversities();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This will delete all associated programs.')) {
      await supabase
        .from('universities')
        .delete()
        .eq('id', id);
      fetchUniversities();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      city: '',
      state: '',
      code: '',
      rank: 0,
      description: '',
      website: ''
    });
    setEditingUniversity(null);
  };

  const openEditModal = (uni: University) => {
    setEditingUniversity(uni);
    setFormData({
      name: uni.name,
      location: uni.location,
      city: uni.city,
      state: uni.state || '',
      code: uni.code || '',
      rank: uni.rank || 0,
      description: uni.description || '',
      website: uni.website || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Universities</h1>
          <p className="text-slate-500">Manage university information and programs</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add University
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <Building2 className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{universities.length}</p>
          <p className="text-sm text-slate-500">Total Universities</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <GraduationCap className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {Object.values(programs).reduce((sum, progs) => sum + progs.length, 0)}
          </p>
          <p className="text-sm text-slate-500">Total Programs</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
            <Star className="text-orange-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {universities.filter(u => u.rank && u.rank <= 100).length}
          </p>
          <p className="text-sm text-slate-500">Top 100 Ranked</p>
        </div>
      </div>

      <div className="space-y-4">
        {universities.map((uni) => (
          <div key={uni.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{uni.name}</h3>
                    {uni.rank > 0 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium flex items-center gap-1">
                        <Star size={14} />
                        Rank #{uni.rank}
                      </span>
                    )}
                    {uni.code && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-mono">
                        {uni.code}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {uni.city}, {uni.state || uni.location}
                    </span>
                    {uni.website && (
                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={16} />
                        Website
                      </a>
                    )}
                  </div>

                  {uni.description && (
                    <p className="text-sm text-slate-600 mb-4">{uni.description}</p>
                  )}

                  {programs[uni.id] && programs[uni.id].length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedUniversity(expandedUniversity === uni.id ? null : uni.id)}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        {expandedUniversity === uni.id ? 'Hide' : 'Show'} Programs ({programs[uni.id].length})
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(uni)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(uni.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedUniversity === uni.id && programs[uni.id] && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Programs Offered</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {programs[uni.id].map((prog) => (
                      <div key={prog.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                            {prog.degree}
                          </span>
                          <h5 className="font-medium text-slate-900">{prog.name}</h5>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{prog.department}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>{prog.duration_years} years</span>
                          <span>Application Fee: ₹{prog.application_fee?.toLocaleString()}</span>
                          {prog.total_fees > 0 && (
                            <span>Total: ₹{prog.total_fees.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingUniversity ? 'Edit University' : 'Add University'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  University Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    University Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., IIT-D"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rank
                  </label>
                  <input
                    type="number"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Brief description about the university"
                />
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
                  {editingUniversity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
