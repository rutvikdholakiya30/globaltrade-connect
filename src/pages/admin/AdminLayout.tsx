import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  LogOut,
  ChevronRight,
  Globe,
  Menu,
  X,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (user && profile && profile.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        signOut();
        navigate('/admin/login');
      }
    }
  }, [user, profile, loading, navigate, signOut]);

  const handleLogout = async () => {
    try {
      alert("Logout button clicked! Attempting to sign out...");
      // Wrap sign out in a timeout to prevent hanging forever
      await Promise.race([
        signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
      ]);
      toast.success('Logged out successfully');
    } catch (err) {
      alert("Sign out timed out or failed, forcing logout anyway!");
    } finally {
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Categories', icon: Layers, href: '/admin/categories' },
    { name: 'Pages', icon: FileText, href: '/admin/pages' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 transform lg:relative lg:translate-x-0",
          isSidebarOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 flex items-center justify-between border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-blue-600 p-2 rounded-xl shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              {isSidebarOpen && (
                <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                  Trade<span className="text-blue-500">Admin</span>
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                  location.pathname === item.href
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", location.pathname === item.href ? "text-white" : "group-hover:text-blue-400")} />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            <div className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-800/50",
              !isSidebarOpen && "justify-center px-0"
            )}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Administrator</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-bold text-blue-600 hover:underline flex items-center">
              View Website <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
