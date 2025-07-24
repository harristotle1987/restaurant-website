// lib/types.ts
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  //category: string; // Add this property
}

export interface SpecialItem {
  id: number;
  title: string;
  description: string;
  discount: string;
  image_url: string; // Changed from image
  valid_until: string;
}