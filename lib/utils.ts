import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
};

export const setCurrentUserId = (userId: string) => {
  localStorage.setItem('userId', userId);
};

export const clearCurrentUserId = () => {
  localStorage.removeItem('userId');
};

