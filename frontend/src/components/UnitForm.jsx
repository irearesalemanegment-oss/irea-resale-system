import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader2, X, MessageSquare, ImagePlus } from 'lucide-react';

const unitSchema = yup.object().shape({
  unit_number: yup.string().required('Unit number is required'),
  developer_id: yup.number().required('Developer is required'),
  compound_id: yup.number().required('Compound is required'),
  unit_type: yup.string().optional(),
  offering_type: yup.string().optional(),
  land_area: yup.number().positive('Must be positive').optional().nullable(),
  bua: yup.number().positive('Must be positive').optional().nullable(),
  description: yup.string().optional(),
  price: yup.number().positive('Must be positive').optional().nullable(),
  state: yup.string().optional(),
  materials: yup.string().optional(),
  material_link: yup.string().url('Invalid URL').optional().nullable().transform(v => v === '' ? undefined : v),
  owner_name: yup.string().optional(),
  owner_phone: yup.string().matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone').optional().nullable().transform(v => v === '' ? undefined : v),
  owner_phones: yup.array().of(yup.string().matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone')).optional(),
  owner_email: yup.string().email('Invalid email').optional().nullable().transform(v => v === '' ? undefined : v),
  status: yup.string().oneOf(['available', 'sold', 'reserved', 'rented']).default('available'),
});

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'rented', label: 'Rented' },
];

const UnitForm = ({ 
  initialData, 
  developers, 
  compounds, 
  onSubmit, 
  onCancel, 
  loading,
  isEditing 
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const filteredCompounds = compounds.filter(c => 
    !initialData?.developer_id || c.developer_id === initialData.developer_id
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(unitSchema),
    defaultValues: {
      unit_number: '',
      developer_id: '',
      compound_id: '',
      unit_type: '',
      offering_type: '',
      land_area: null,
      bua: null,
      description: '',
      price: null,
      state: '',
      materials: '',
      material_link: '',
      owner_name: '',
      owner_phone: '',
      owner_phones: [],
      owner_email: '',
      status: 'available',
      ...initialData,
    },
  });

  const [additionalPhones, setAdditionalPhones] = useState(
    Array.isArray(initialData?.owner_phones) ? initialData.owner_phones : []
  );

  const addPhone = () => setAdditionalPhones(prev => [...prev, '']);
  const removePhone = (index) => setAdditionalPhones(prev => prev.filter((_, i) => i !== index));
  const handlePhoneChange = (index, value) => {
    setAdditionalPhones(prev => prev.map((p, i) => i === index ? value : p));
  };

  const watchedDeveloperId = watch('developer_id');

  // Reset compound when developer changes
  useEffect(() => {
    if (watchedDeveloperId !== initialData?.developer_id) {
      setValue('compound_id', '');
    }
  }, [watchedDeveloperId, initialData?.developer_id, setValue]);

  const handleWhatsAppClick = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    const previews = newImages.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newImages.map(f => URL.createObjectURL(f)));
  };

  const handleFormSubmit = (data) => {
    const cleanPhones = additionalPhones.filter(p => p && p.trim() !== '');
    onSubmit({ ...data, owner_phones: cleanPhones }, selectedImages);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* Unit Details Section */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          Unit Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Number *</label>
            <input
              {...register('unit_number')}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.unit_number ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., A-101"
            />
            {errors.unit_number && <p className="mt-1.5 text-sm text-red-600">{errors.unit_number.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Developer *</label>
            <select
              {...register('developer_id', { valueAsNumber: true })}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.developer_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Developer</option>
              {developers.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
            {errors.developer_id && <p className="mt-1.5 text-sm text-red-600">{errors.developer_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Compound *</label>
            <select
              {...register('compound_id', { valueAsNumber: true })}
              disabled={filteredCompounds.length === 0}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.compound_id ? 'border-red-300' : 'border-gray-300'
              } disabled:bg-gray-50`}
            >
              <option value="">Select Compound</option>
              {filteredCompounds.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
            {filteredCompounds.length === 0 && !errors.developer_id && (
              <p className="mt-1.5 text-sm text-gray-500">Select a developer first</p>
            )}
            {errors.compound_id && <p className="mt-1.5 text-sm text-red-600">{errors.compound_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Type</label>
            <input
              {...register('unit_type')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Apartment, Villa, Office"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Offering Type</label>
            <input
              {...register('offering_type')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Resale, New Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Land Area (sqm)</label>
            <input
              {...register('land_area', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">BUA (sqm)</label>
            <input
              {...register('bua', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (EGP)</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Unit description, features, amenities..."
        />
      </section>

      {/* Location & State */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State/Region</label>
            <input
              {...register('state')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., New Cairo, Sheikh Zayed"
            />
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Materials & Finishing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Materials Description</label>
            <textarea
              {...register('materials')}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Finishing specs, materials used..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Material Link</label>
            <input
              {...register('material_link')}
              type="url"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/materials.pdf"
            />
            {errors.material_link && <p className="mt-1.5 text-sm text-red-600">{errors.material_link.message}</p>}
          </div>
        </div>
      </section>

      {/* Owner Information */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          Owner Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name</label>
            <input
              {...register('owner_name')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Owner full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Phone</label>
            <div className="flex gap-2">
              <input
                {...register('owner_phone')}
                type="tel"
                className={`flex-1 px-4 py-2.5 rounded-lg border text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.owner_phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+20 10 1234 5678"
              />
              <button
                type="button"
                onClick={() => handleWhatsAppClick(watch('owner_phone'))}
                disabled={!watch('owner_phone') || isSubmitting}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Open WhatsApp Web"
              >
                <MessageSquare size={18} />
              </button>
            </div>
            {errors.owner_phone && <p className="mt-1.5 text-sm text-red-600">{errors.owner_phone.message}</p>}
          </div>

          {/* Additional Phones (Optional) */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Phones (Optional)</label>
            <div className="space-y-2">
              {additionalPhones.map((phone, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+20 10 1234 5678"
                  />
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Remove phone"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPhone}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                + Add Phone
              </button>
            </div>
            {errors.owner_phones && <p className="mt-1.5 text-sm text-red-600">{errors.owner_phones.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Email</label>
            <input
              {...register('owner_email')}
              type="email"
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.owner_email ? 'border-red-300' : 'border-gray-300'
              }}`}
              placeholder="owner@example.com"
            />
            {errors.owner_email && <p className="mt-1.5 text-sm text-red-600">{errors.owner_email.message}</p>}
          </div>
        </div>
      </section>

      {/* Images Section */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <ImagePlus size={18} className="text-purple-600" />
          </span>
          Unit Images
        </h2>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
              <img src={src} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ImagePlus size={20} className="text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">Upload up to 10 images (JPG, PNG, GIF, WEBP). Max 5MB each.</p>
      </section>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isEditing ? 'Update Unit' : 'Create Unit'}
        </button>
      </div>
    </form>
  );
};

export default UnitForm;
