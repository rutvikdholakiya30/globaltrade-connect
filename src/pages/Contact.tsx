import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Page } from '@/src/types';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    async function fetchPage() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('name', 'contact')
        .eq('is_active', true)
        .single();
      if (data) setPage(data);
      setLoading(false);
    }
    fetchPage();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form data:', data);
    toast.success('Message sent successfully! We will get back to you soon.');
    reset();
    setIsSubmitting(false);
  };

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
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">Get in Touch</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about our products or services? Our trade experts are here to help you navigate the global market.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Our Location</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      123 Trade Center, Business District, Dubai, UAE
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Phone Number</p>
                    <p className="text-sm text-gray-500">+971 4 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Email Address</p>
                    <p className="text-sm text-gray-500">info@globaltradeconnect.com</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="font-bold text-gray-900">Business Hours</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Mon - Fri</span>
                  <span className="font-bold text-gray-900">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Saturday</span>
                  <span className="font-bold text-gray-900">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sunday</span>
                  <span className="text-red-500 font-bold">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Global Support</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                We provide 24/7 support for our international clients across different time zones.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Send us a Message</h3>
                  <p className="text-gray-500">Fill out the form below and our team will get back to you within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Name</label>
                      <input
                        {...register('name')}
                        className={cn(
                          "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                          errors.name && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        )}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs font-bold text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email Address</label>
                      <input
                        {...register('email')}
                        className={cn(
                          "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                          errors.email && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        )}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Subject</label>
                    <input
                      {...register('subject')}
                      className={cn(
                        "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                        errors.subject && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      )}
                      placeholder="Inquiry about Machinery Export"
                    />
                    {errors.subject && <p className="text-xs font-bold text-red-500">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Message</label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className={cn(
                        "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none",
                        errors.message && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      )}
                      placeholder="Tell us more about your requirements..."
                    />
                    {errors.message && <p className="text-xs font-bold text-red-500">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
