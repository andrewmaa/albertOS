import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import useLocalStorage from "@/lib/useLocalStorage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  return useLocalStorage('userId', undefined);
};

export const setCurrentUserId = (userId: string) => {
  useLocalStorage('userId', userId);
};

export const clearCurrentUserId = () => {
  useLocalStorage('userId', undefined);
};

