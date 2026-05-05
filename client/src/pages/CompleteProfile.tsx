import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { COLOMBIAN_DATA } from '../data/colombia';
import { Briefcase, MapPin, FileText, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

const CompleteProfile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    serviceCategoryId: '',
    bio: '',
    locationCity: '',
    locationRegion: '',
    availabilityNotes: '',
  });
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Find cities for the selected department
  const selectedDept = COLOMBIAN_DATA.find(d => d.name === formData.locationRegion);
  const cities = selectedDept ? selectedDept.cities : [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await api.get('/categories');
        console.log('Categories response:', response.data);
        const fetchedCategories = response.data.categories || [];
        // Map to ensure 'name' property exists if API returns nameEs/nameEn
        const normalizedCategories = fetchedCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name || cat.nameEs || cat.nameEn || 'Sin nombre',
        }));
        setCategories(normalizedCategories);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar categorías: ' + (err.response?.data?.message || err.message));
      } finally {
        setFetching(false);
      }
    };
    fetchCategories();
  }, []);

  // Pre-cargar datos si ya existen
  useEffect(() => {
    if (user?.providerProfile) {
      const profile = user.providerProfile;
      setFormData({
        serviceCategoryId: profile.serviceCategoryId || '',
        bio: profile.bio || '',
        locationCity: profile.locationCity || '',
        locationRegion: profile.locationRegion || '',
        availabilityNotes: profile.availabilityNotes || '',
      });
      setCertifications(profile.certifications || []);
    }
  }, [user]);

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ 
      ...formData, 
      locationRegion: e.target.value,
      locationCity: '' // Reset city when department changes
    });
  };

  const addCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const removeCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceCategoryId) {
      setError('Por favor selecciona una categoría');
      return;
    }

    if (!formData.locationRegion) {
      setError('Por favor selecciona un departamento');
      return;
    }

    if (!formData.locationCity) {
      setError('Por favor selecciona una ciudad');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/providers/register', {
        ...formData,
        certifications,
      });
      await checkAuth(); 
      navigate('/'); 
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      if (serverError?.details && Array.isArray(serverError.details)) {
        const detailMsgs = serverError.details.map((d: any) => d.message).join('. ');
        setError(`${serverError.message}: ${detailMsgs}`);
      } else {
        setError(serverError?.message || err.response?.data?.message || 'Error al guardar el perfil. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-3xl font-bold">Completa tu Perfil Profesional</h2>
          <p className="mt-2 text-indigo-100 italic">
            Cuéntanos sobre tus servicios para que el administrador pueda aprobar tu cuenta.
          </p>
        </div>

        {user?.providerProfile?.status === 'REJECTED' && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-1">
              <AlertTriangle className="h-5 w-5" />
              <span>Motivo del rechazo anterior:</span>
            </div>
            <p className="text-red-600 text-sm italic">"{user.providerProfile.rejectionReason}"</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-indigo-500" />
              ¿Qué servicio principal ofreces?
            </label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.serviceCategoryId}
              onChange={(e) => setFormData({ ...formData, serviceCategoryId: e.target.value })}
            >
              <option value="">Selecciona tu categoría...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-indigo-500" />
              Especialidades / Certificaciones
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ej: Gasista Matriculado"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
              />
              <button
                type="button"
                onClick={addCert}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCert(index)}
                    className="ml-2 text-indigo-400 hover:text-indigo-600 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                Departamento
              </label>
              <select
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.locationRegion}
                onChange={handleDeptChange}
              >
                <option value="">Selecciona...</option>
                {COLOMBIAN_DATA.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                Ciudad
              </label>
              <select
                required
                disabled={!formData.locationRegion}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
              >
                <option value="">Selecciona ciudad...</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-500" />
              Biografía / Experiencia
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Describe tus años de experiencia y por qué los clientes deberían elegirte..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              Notas de Disponibilidad (Opcional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ej: Lun-Vie 9:00 a 18:00, emergencias 24h"
              value={formData.availabilityNotes}
              onChange={(e) => setFormData({ ...formData, availabilityNotes: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                {user?.providerProfile ? 'Actualizar y Re-enviar Perfil' : 'Enviar Solicitud de Aprobación'}
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
