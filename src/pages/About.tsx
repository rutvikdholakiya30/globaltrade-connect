import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Page } from '@/src/types';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, Users, Target, Award } from 'lucide-react';

export default function About() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('name', 'about')
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
    <main className="pt-24 pb-24 bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
            alt="Modern Office"
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">About GlobalTradeConnect</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are a leading international trade company dedicated to bridging the gap between global manufacturers and buyers with integrity and efficiency.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Story & Mission</h2>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                {page?.content ? (
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                  <>
                    <p>
                      Founded in 2010, GlobalTradeConnect started with a simple vision: to make international trade accessible, transparent, and secure for businesses of all sizes. Over the years, we have grown into a trusted partner for thousands of companies worldwide.
                    </p>
                    <p>
                      Our mission is to empower global commerce by providing high-quality products, reliable logistics, and expert trade consultancy. We believe in building long-term relationships based on mutual trust and shared success.
                    </p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-3xl">
                  <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Our Vision</h4>
                    <p className="text-sm text-gray-600">To be the world's most reliable trade bridge.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-3xl">
                  <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Our Values</h4>
                    <p className="text-sm text-gray-600">Integrity, Quality, and Innovation.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000"
                  alt="Team Collaboration"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl hidden sm:block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Expert Team</p>
                    <p className="text-sm text-gray-500">50+ Trade Specialists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-5xl font-extrabold text-blue-600">14+</p>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-extrabold text-blue-600">5000+</p>
              <p className="text-gray-600 font-medium">Happy Clients</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-extrabold text-blue-600">50+</p>
              <p className="text-gray-600 font-medium">Countries Served</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-extrabold text-blue-600">24/7</p>
              <p className="text-gray-600 font-medium">Trade Support</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
