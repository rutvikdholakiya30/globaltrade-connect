export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  specifications: Record<string, string>;
  price: number | null;
  images: string[];
  status: 'active' | 'inactive';
  created_at: string;
  category?: Category;
}

export interface Page {
  id: string;
  name: 'about' | 'privacy' | 'terms' | 'contact';
  content: string;
  is_active: boolean;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}
