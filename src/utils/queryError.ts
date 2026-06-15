import { AuthSessionExpiredError, UserFriendlyError } from '@/types/errors';
import { ErrorTranslationService } from '@/services/ErrorTranslationService';

// Traduce el error de una query/mutation a UserFriendlyError, silenciando
// AuthSessionExpiredError: el httpClient ya limpió el storage y emitió el evento,
// y el AuthContext maneja el redirect a login. No se expone al usuario.
export const translateQueryError = (err: unknown): UserFriendlyError | null => {
  if (!err || err instanceof AuthSessionExpiredError) {
    return null;
  }
  return ErrorTranslationService.translate(err);
};
