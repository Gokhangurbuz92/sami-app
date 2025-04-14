export interface User {
  id: string;
  name: string;
  email: string;
  role: 'professional' | 'young';
  profilePicture?: string;
  createdAt: Date;
  lastActive: Date;
  roomNumber?: string; // Numéro de chambre pour les jeunes
} 