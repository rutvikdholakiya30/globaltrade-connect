import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Page } from '@/src/types';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('name', 'privacy')
        .eq('is_active', true)
        .single();
      if (data) setPage(data);
      setLoading(false);
    }
    fetchPage();
  }, []);

  if (loading) return <div className="pt-40 text-center animate-pulse">Loading...</div>;

  if (!page) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-gray-900">Page Not Found</h1>
        <p className="text-gray-500">This page is currently unavailable or has been removed.</p>
        <Link to="/" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-24 bg-gray-50">
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Privacy First</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 prose prose-blue max-w-none text-gray-600 leading-relaxed">
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-blue-600" />
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us when you use our website, including your name, email address, phone number, and any other information you choose to provide through our contact forms or inquiry systems.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-blue-600" />
                  2. How We Use Your Information
                </h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, to respond to your inquiries, to communicate with you about products and services, and to protect the rights and property of GlobalTradeConnect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-blue-600" />
                  3. Data Security
                </h2>
                <p>
                  We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  4. Your Choices
                </h2>
                <p>
                  You may update or correct information about yourself at any time by contacting us. You may also opt out of receiving promotional communications from us by following the instructions in those communications.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
