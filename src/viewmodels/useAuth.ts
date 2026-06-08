/**
 * useAuth — consumer del AuthContext.
 *
 * La lógica completa de auth (estado, login, register, restore, logout,
 * listener de session expired) vive en src/context/AuthContext.tsx.
 *
 * Este hook se mantiene como punto de entrada estable para los componentes
 * y screens que ya lo importan.
 */

import { useAuthContext, type AuthContextValue } from '@/context/AuthContext';

export type UseAuthReturn = AuthContextValue;

export const useAuth = (): UseAuthReturn => useAuthContext();

export default useAuth;
