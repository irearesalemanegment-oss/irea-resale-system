const handleShare = (unitId) => {
  const url = `${window.location.origin}/unit/${unitId}/share`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link copied to clipboard!');
  });
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

﻿import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { unitsAPI, imagesAPI, developersAPI, compoundsAPI, phoneAccessAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Ruler, BedDouble, Bath, Loader2, MessageSquare, Eye, EyeOff, Building2, Home, Share2, Calendar } from 'lucide-react';

const statusColors = {
  available: 'bg-green-100 text-green-800',
  sold: 'bg-red-100 text-red-800',
  reserved: 'bg-amber-100 text-amber-800',
  rented: 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  available: 'Available',
  sold: 'Sold',
  reserved: 'Reserved',
  rented: 'Rented',
};

const formatPrice = (price) => {
  if (!price) return '-';
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
};

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [units, setUnits] = useState([]);
  const [images, setImages] = useState({});
  const [developers, setDevelopers] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ developer_id: '', compound_id: '', status: '', unit_type: '' });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [phoneAccess, setPhoneAccess] = useState({});
  const [requesting, setRequesting] = useState(null);
  const [message, setMessage] = useState('');

  const isAgent = user?.role === 'agent';
  const isAdminManager = hasRole(['admin', 'manager']);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.developer_id) params.developer_id = filters.developer_id;
      if (filters.compound_id) params.compound_id = filters.compound_id;
      if (filters.status) params.status = filters.status;
      if (filters.unit_type) params.unit_type = filters.unit_type;
      if (search) params.search = search;

      const [unitsRes, devsRes, compsRes] = await Promise.all([
        unitsAPI.getAll({ ...params, limit: 100, scope: 'all' }),
        developersAPI.getAll({ is_active: true }),
        compoundsAPI.getAll({ is_active: true }),
      ]);

      setUnits(unitsRes.data.units);
      setDevelopers(devsRes.data.developers);
      setCompounds(compsRes.data.compounds);

      // Fetch images for all units
      const imgMap = {};
      for (const unit of unitsRes.data.units) {
        try {
          const imgRes = await imagesAPI.getByUnit(unit.id);
          imgMap[unit.id] = imgRes.data.images;
        } catch (e) { imgMap[unit.id] = []; }
      }
      setImages(imgMap);

      // For agents, check phone access for each unit
      if (isAgent) {
        const accessMap = {};
        for (const unit of unitsRes.data.units) {
          try {
            const accRes = await phoneAccessAPI.check(unit.id);
            accessMap[unit.id] = accRes.data.hasAccess;
          } catch (e) { accessMap[unit.id] = false; }
        }
        setPhoneAccess(accessMap);
      }
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filters.developer_id, filters.compound_id, filters.status, filters.unit_type]);

  const handleRequestPhone = async (unitId) => {
    setRequesting(unitId);
    setMessage('');
    try {
      await phoneAccessAPI.request(unitId);
      setMessage('Phone access request sent. Waiting for admin approval.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to request phone access');
    } finally {
      setRequesting(null);
    }
  };

  const openUnit = async (unit) => {
    setSelectedUnit(unit);
    setSelectedImages(images[unit.id] || []);
    if (isAgent && !phoneAccess[unit.id]) {
      try {
        const accRes = await phoneAccessAPI.check(unit.id);
        setPhoneAccess(prev => ({ ...prev, [unit.id]: accRes.data.hasAccess }));
      } catch (e) {}
    }
  };

  const closeUnit = () => {
    setSelectedUnit(null);
    setSelectedImages([]);
  };

  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const getUnitImage = (unit) => {
    const unitImgs = images[unit.id] || [];
    if (unitImgs.length > 0) {
      const primary = unitImgs.find(i => i.is_primary) || unitImgs[0];
      return `http://localhost:3000${primary.image_url}`;
    }
    return null;
  };

  const filteredCompounds = filters.developer_id
    ? compounds.filter(c => c.developer_id === parseInt(filters.developer_id))
    : compounds;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Browse available resale units</p>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {message}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search units, owners, developers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.developer_id}
            onChange={(e) => { setFilters(f => ({ ...f, developer_id: e.target.value, compound_id: '' })); }}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Developers</option>
            {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            value={filters.compound_id}
            onChange={(e) => setFilters(f => ({ ...f, compound_id: e.target.value }))}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Compounds</option>
            {filteredCompounds.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="rented">Rented</option>
          </select>
          <select
            value={filters.unit_type}
            onChange={(e) => setFilters(f => ({ ...f, unit_type: e.target.value }))}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Office">Office</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Loading units...</p>
        </div>
      ) : units.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border">
          <Home size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No units found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {units.map(unit => {
            const img = getUnitImage(unit);
            return (
              <div
                key={unit.id}
                onClick={() => openUnit(unit)}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {img ? (
                    <img src={img} alt={unit.unit_number} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={48} className="text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[unit.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[unit.status] || unit.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xl font-bold text-gray-900">{formatPrice(unit.price)}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{unit.unit_type || 'Unit'} · {unit.unit_number}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {unit.compound_name || 'N/A'} · {unit.developer_name || 'N/A'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(unit.created_at)}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleShare(unit.id); }} className="text-gray-400 hover:text-blue-600 p-1" title="Share">
                      <Share2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    {unit.bua && (
                      <span className="flex items-center gap-1">
                        <Ruler size={14} /> {unit.bua} sqm
                      </span>
                    )}
                    {unit.land_area && (
                      <span className="flex items-center gap-1">
                        <Home size={14} /> {unit.land_area} sqm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-4 px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={closeUnit} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10">
            {/* Image */}
            <div className="relative h-72 bg-gray-100">
              {selectedImages.length > 0 ? (
                <img
                  src={`http://localhost:3000${selectedImages[0].image_url}`}
                  alt={selectedUnit.unit_number}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 size={64} className="text-gray-300" />
                </div>
              )}
              <button
                onClick={closeUnit}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <span className="text-gray-600 text-xl leading-none">×</span>
              </button>
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedUnit.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[selectedUnit.status] || selectedUnit.status}
              </span>
            </div>

            {/* Thumbnails */}
            {selectedImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {selectedImages.map((img, i) => (
                  <img
                    key={img.id}
                    src={`http://localhost:3000${img.image_url}`}
                    alt={`${selectedUnit.unit_number} ${i+1}`}
                    className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{formatPrice(selectedUnit.price)}</h2>
                  <p className="text-gray-600 mt-1">{selectedUnit.unit_type || 'Unit'} · {selectedUnit.unit_number}</p>
                  <p className="text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={16} />
                    {selectedUnit.compound_name || 'N/A'} · {selectedUnit.developer_name || 'N/A'}
                    {selectedUnit.state ? ` · ${selectedUnit.state}` : ''}
                  </p>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {selectedUnit.bua && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <Ruler size={20} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selectedUnit.bua} sqm</p>
                    <p className="text-xs text-gray-500">BUA</p>
                  </div>
                )}
                {selectedUnit.land_area && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <Home size={20} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selectedUnit.land_area} sqm</p>
                    <p className="text-xs text-gray-500">Land Area</p>
                  </div>
                )}
                {selectedUnit.offering_type && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <Building2 size={20} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-sm font-medium text-gray-900">{selectedUnit.offering_type}</p>
                    <p className="text-xs text-gray-500">Offering</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <Home size={20} className="mx-auto text-blue-600 mb-1" />
                  <p className="text-sm font-medium text-gray-900">{selectedUnit.unit_type || '-'}</p>
                  <p className="text-xs text-gray-500">Type</p>
                </div>
              </div>

              {/* Description */}
              {selectedUnit.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedUnit.description}</p>
                </div>
              )}

              {/* Owner / Contact */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedUnit.owner_name || 'N/A'}</p>
                    {selectedUnit.owner_phone && (
                      <p className="text-gray-600 mt-1">
                        {selectedUnit.owner_phone}
                        {selectedUnit.phone_masked && <span className="text-xs text-gray-400 ml-2">(masked)</span>}
                      </p>
                    )}
                    {Array.isArray(selectedUnit.owner_phones) && selectedUnit.owner_phones.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {selectedUnit.owner_phones.map((phone, idx) => (
                          <p key={idx} className="text-gray-600 text-sm">
                            {phone}
                            {selectedUnit.phone_masked && <span className="text-xs text-gray-400 ml-2">(masked)</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedUnit.owner_phone && (
                      <button
                        onClick={() => handleWhatsApp(selectedUnit.owner_phone)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MessageSquare size={18} />
                        WhatsApp
                      </button>
                    )}
                    {isAgent && selectedUnit.phone_masked && !phoneAccess[selectedUnit.id] && (
                      <button
                        onClick={() => handleRequestPhone(selectedUnit.id)}
                        disabled={requesting === selectedUnit.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Eye size={18} />
                        {requesting === selectedUnit.id ? 'Requesting...' : 'Request Phone'}
                      </button>
                    )}
                    {isAgent && phoneAccess[selectedUnit.id] && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                        <EyeOff size={18} />
                        Phone Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
