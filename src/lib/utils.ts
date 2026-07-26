import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

const DELETED_KEY = 'resumind_deleted_ids';

export function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markIdAsDeleted(id: string): void {
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}
