export interface IProperty {
  id: number;
  title: string;
  description: string;
  city: string;
  price_per_night: number;
  max_guests: number;
  owner: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  rejection_reason: string;
  images: string[];
  created_at: string;
}

export const PROPERTY_PHOTOS: string[] = Array.from({ length: 20 }, (_, i) => `photo_${i}.jpg`);

export function getPropertyPhotoUrl(filename: string): string {
  return `/assets/property_photos/${filename}`;
}
