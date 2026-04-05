import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, X, Globe, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Category, Product } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { toast } from 'react-hot-toast';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().optional().default(''),
  price: z.union([z.number(), z.nan(), z.null()]).optional().transform(v => Number.isNaN(v) ? null : v),
  status: z.enum(['active', 'inactive']),
  specifications: z.array(z.object({
    key: z.string().min(1, 'Key required'),
    value: z.string().min(1, 'Value required'),
  })).optional(),
});

type ProductFormData = z.input<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [listModes, setListModes] = useState<Record<number, 'none' | 'bullet' | 'number'>>({});

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
      description: '',
      specifications: [{ key: '', value: '' }],
    }
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications'
  });

  const specValues = watch('specifications');

  const toggleListMode = (index: number, mode: 'bullet' | 'number') => {
    const currentMode = listModes[index];
    const newMode = currentMode === mode ? 'none' : mode;
    setListModes(prev => ({ ...prev, [index]: newMode }));
    
    const currentVal = specValues?.[index]?.value || '';
    const cleanLines = currentVal.split('\n').map(line => line.replace(/^[•\-\*]\s*|^\d+\.\s*/, '').trim());

    if (newMode === 'bullet') {
      const newVal = cleanLines.map(line => line === '' ? '' : `• ${line}`).join('\n');
      setValue(`specifications.${index}.value`, newVal);
    } else if (newMode === 'number') {
      const newVal = cleanLines.map((line, i) => line === '' ? '' : `${i + 1}. ${line}`).join('\n');
      setValue(`specifications.${index}.value`, newVal);
    } else {
      setValue(`specifications.${index}.value`, cleanLines.join('\n'));
    }
  };

  const handleSpecKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key === 'Enter' && listModes[index] !== 'none') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      const lines = value.substring(0, start).split('\n');
      const currentLineCount = lines.length;
      
      let prefix = '\n• ';
      let cursorOffset = 3;

      if (listModes[index] === 'number') {
        prefix = `\n${currentLineCount + 1}. `;
        cursorOffset = prefix.length;
      }
      
      const newValue = value.substring(0, start) + prefix + value.substring(end);
      setValue(`specifications.${index}.value`, newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
      }, 0);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) setCategories(cats);

      if (id) {
        const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
        if (prod) {
          const specs = prod.specifications ? Object.entries(prod.specifications).map(([key, value]) => ({ key, value: String(value) })) : [];
          
          // Auto-detect list modes
          const initialListModes: Record<number, 'none' | 'bullet' | 'number'> = {};
          specs.forEach((s, idx) => {
            const lines = s.value.split('\n');
            if (lines.every(line => line.trim() === '' || line.trim().startsWith('•'))) {
              initialListModes[idx] = 'bullet';
            } else if (lines.every((line, i) => line.trim() === '' || line.trim().startsWith(`${i + 1}.`))) {
              initialListModes[idx] = 'number';
            } else {
              initialListModes[idx] = 'none';
            }
          });
          setListModes(initialListModes);

          reset({
            name: prod.name,
            category_id: prod.category_id,
            description: prod.description,
            price: prod.price,
            status: prod.status,
            specifications: specs.length > 0 ? specs : [{ key: '', value: '' }],
          });
          setImages(prod.images || []);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      toast.error('You can only upload a maximum of 8 images (1 Main + 7 Gallery).');
      return;
    }

    setUploading(true);
    const newImages = [...images];

    for (const file of Array.from(files) as File[]) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading ${file.name}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      newImages.push(publicUrlData.publicUrl);
    }

    setImages(newImages);
    setUploading(false);
    toast.success('Images uploaded successfully');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const specsObj = data.specifications?.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        name: data.name,
        category_id: data.category_id,
        description: data.description,
        price: data.price || null,
        status: data.status,
        specifications: specsObj,
        images: images,
      };

      if (id) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-96 bg-white rounded-3xl" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              General Information
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Product Name</label>
              <input
                {...register('name')}
                className={cn(
                  "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                  errors.name && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                )}
                placeholder="e.g. Industrial Water Pump X-500"
              />
              {errors.name && <p className="text-xs font-bold text-red-500 ml-1">{errors.name.message}</p>}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                <select
                  {...register('category_id')}
                  className={cn(
                    "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none",
                    errors.category_id && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  )}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {errors.category_id && <p className="text-xs font-bold text-red-500 ml-1">{errors.category_id.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1 tracking-tight uppercase text-[10px]">Description</label>
              <div className="bg-gray-50 border border-gray-200 rounded-[1.5rem] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={quillModules}
                      placeholder="Describe the product features, benefits, and export details..."
                      className="bg-white"
                    />
                  )}
                />
              </div>
              {errors.description && <p className="text-xs font-bold text-red-500 ml-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Technical Specifications
              </h3>
              <button
                type="button"
                onClick={() => append({ key: '', value: '' })}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Field
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-4 p-4 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Label</label>
                        <input
                          {...register(`specifications.${index}.key` as const)}
                          placeholder="e.g. Material"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase">Value</label>
                           <div className="flex items-center space-x-3">
                             <label className="flex items-center space-x-1.5 cursor-pointer group/toggle">
                                <input 
                                  type="checkbox" 
                                  checked={listModes[index] === 'bullet'} 
                                  onChange={() => toggleListMode(index, 'bullet')}
                                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={cn("text-[10px] font-black transition-colors uppercase", listModes[index] === 'bullet' ? "text-blue-600" : "text-gray-400 group-hover/toggle:text-blue-600")}>Bullets</span>
                             </label>
                             <label className="flex items-center space-x-1.5 cursor-pointer group/toggle">
                                <input 
                                  type="checkbox" 
                                  checked={listModes[index] === 'number'} 
                                  onChange={() => toggleListMode(index, 'number')}
                                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={cn("text-[10px] font-black transition-colors uppercase", listModes[index] === 'number' ? "text-blue-600" : "text-gray-400 group-hover/toggle:text-blue-600")}>Numbers</span>
                             </label>
                           </div>
                        </div>
                        <textarea
                          {...register(`specifications.${index}.value` as const)}
                          onKeyDown={(e) => handleSpecKeyDown(e, index)}
                          placeholder="e.g. Stainless Steel"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[46px] resize-y font-medium text-gray-700"
                          rows={listModes[index] !== 'none' ? 3 : 1}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-3 mt-5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Images */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                Product Images
              </h3>
              <p className="text-xs font-bold text-gray-400">{images.length} / 8 Uploaded</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border-2 group",
                  idx === 0 ? "border-blue-500 shadow-md col-span-2 row-span-2 aspect-video md:aspect-square md:col-span-1 md:row-span-1" : "border-gray-100"
                )}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2">
                    {idx === 0 ? (
                      <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">Main Image</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-900/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">Gallery {idx}</span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsMainImage(idx)}
                        className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {images.length < 8 && (
                <label className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all",
                  uploading && "opacity-50 cursor-not-allowed"
                )}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center px-4">
                        {images.length === 0 ? 'Upload Main Image' : 'Upload Gallery Image'}
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Status & Save */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">Visibility Status</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => reset({ ...control._formValues, status: 'active' })}
                  className={cn(
                    "py-3 rounded-xl text-sm font-bold transition-all border",
                    control._formValues.status === 'active' ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => reset({ ...control._formValues, status: 'inactive' })}
                  className={cn(
                    "py-3 rounded-xl text-sm font-bold transition-all border",
                    control._formValues.status === 'inactive' ? "bg-gray-100 border-gray-300 text-gray-600" : "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  Inactive
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{id ? 'Update Product' : 'Publish Product'}</span>
                  <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
