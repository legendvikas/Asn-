import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error.code === 'permission-denied') {
    // In a real app, you'd get auth info from a global auth state
    // For now we just throw a structured error
    const errorInfo: FirestoreErrorInfo = {
       error: error.message,
       operationType,
       path,
       authInfo: {
         userId: 'unknown',
         email: 'unknown',
         emailVerified: false,
         isAnonymous: true,
         providerInfo: []
       }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
