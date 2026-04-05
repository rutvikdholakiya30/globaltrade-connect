import React, { useEffect, useState } from 'react';
import { FileText, Eye, EyeOff, Edit, Save, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { Page } from '@/src/types';
import { formatDate, cn } from '@/src/lib/utils';
import { toast } from 'react-hot-toast';

export default function PageManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch pages');
    } else if (data) {
      setPages(data);
    }
    setLoading(false);
  }

  const toggleStatus = async (page: Page) => {
    const newStatus = !page.is_active;
    const { error } = await supabase
      .from('pages')
      .update({ is_active: newStatus })
      .eq('id', page.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Page ${newStatus ? 'activated' : 'deactivated'}`);
      setPages(pages.map(p => p.id === page.id ? { ...p, is_active: newStatus } : p));
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setContent(page.content);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', editingPage.id);

      if (error) throw error;
      toast.success('Page content updated successfully');
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, content } : p));
      setEditingPage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update page');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Page Control</h1>
        <p className="text-gray-500">Manage the content and visibility of your website's static pages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Page List */}
        <div className="space-y-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
            ))
          ) : pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                "bg-white p-8 rounded-[2.5rem] border transition-all duration-300",
                editingPage?.id === page.id ? "border-blue-600 shadow-lg shadow-blue-600/10" : "border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-4 rounded-2xl transition-colors",
                    page.is_active ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{page.name} Page</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Last updated {formatDate(page.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      editingPage?.id === page.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                    )}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleStatus(page)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      page.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
                    )}
                    title={page.is_active ? "Deactivate Page" : "Activate Page"}
                  >
                    {page.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  page.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {page.is_active ? 'Visible on Website' : 'Hidden from Website'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="lg:sticky lg:top-28 h-fit">
          {editingPage ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-600/5 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-blue-600" />
                  Editing {editingPage.name}
                </h3>
                <button
                  onClick={() => setEditingPage(null)}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Page Content (HTML Supported)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm resize-none"
                  placeholder="Enter page content here..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={submitting}
                className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save Changes</span>
                    <Save className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Globe className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-400">Select a page to edit</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Choose one of the pages from the list to modify its content and settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
