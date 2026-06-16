import i18n from '@/i18n';
import type { AuthError, RegisterCredentials } from '@/types/auth';
import {
  doPasswordsMatch,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from '@/utils/validators';

// Valida las credenciales de registro y devuelve el primer AuthError (con field
// e i18n) o null si son válidas. Vive en utils para mantener a AuthContext
// enfocado en el ciclo de sesión, no en las reglas de validación de formularios.
// Separado de validators.ts (puro) porque arrastra la dependencia de i18n.
export function validateRegisterCredentials(credentials: RegisterCredentials): AuthError | null {
  if (!isValidFullName(credentials.full_name)) {
    return { message: i18n.t('auth.errors.nameTooShort'), field: 'full_name' };
  }

  if (!isValidEmail(credentials.email)) {
    return { message: i18n.t('auth.errors.invalidEmail'), field: 'email' };
  }

  if (!isValidPassword(credentials.password)) {
    return { message: i18n.t('auth.errors.passwordTooShort'), field: 'password' };
  }

  if (!doPasswordsMatch(credentials.password, credentials.confirmPassword)) {
    return { message: i18n.t('auth.errors.passwordMismatch'), field: 'confirmPassword' };
  }

  return null;
}
