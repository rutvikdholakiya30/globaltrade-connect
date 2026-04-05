import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Page } from '@/src/types';
import { FileText, Scale, Gavel, AlertCircle } from 'lucide-react';

export default function Terms() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('name', 'terms')
        .eq('is_active', true)
        .single();
      if (data) setPage(data);
      setLoading(false);
    }
    fetchPage();
  }, []);

  if (loading) return <div className="pt-40 text-center">Loading...</div>;

  return (
    <main className="pt-24 pb-24 bg-gray-50">
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Please read these terms and conditions carefully before using our services.
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
                  <Gavel className="w-6 h-6 mr-3 text-blue-600" />
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                  2. Use of Service
                </h2>
                <p>
                  You agree to use the service only for purposes that are permitted by the terms and any applicable law, regulation or generally accepted practices or guidelines in the relevant jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  3. Intellectual Property
                </h2>
                <p>
                  The service and its original content, features and functionality are and will remain the exclusive property of GlobalTradeConnect and its licensors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Scale className="w-6 h-6 mr-3 text-blue-600" />
                  4. Limitation of Liability
                </h2>
                <p>
                  In no event shall GlobalTradeConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
