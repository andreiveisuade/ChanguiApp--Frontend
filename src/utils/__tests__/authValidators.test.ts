import { validateRegisterCredentials } from '@/utils/authValidators';

jest.mock('@/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));

const validCredentials = {
  full_name: 'Juan Perez',
  email: 'juan@test.com',
  password: 'secret123',
  confirmPassword: 'secret123',
};

describe('validateRegisterCredentials', () => {
  it('devuelve null con credenciales válidas', () => {
    expect(validateRegisterCredentials(validCredentials)).toBeNull();
  });

  it('rechaza nombre demasiado corto', () => {
    const result = validateRegisterCredentials({ ...validCredentials, full_name: 'A' });
    expect(result).toEqual({ message: 'auth.errors.nameTooShort', field: 'full_name' });
  });

  it('rechaza email inválido', () => {
    const result = validateRegisterCredentials({ ...validCredentials, email: 'no-es-email' });
    expect(result).toEqual({ message: 'auth.errors.invalidEmail', field: 'email' });
  });

  it('rechaza password demasiado corta', () => {
    const result = validateRegisterCredentials({
      ...validCredentials,
      password: '123',
      confirmPassword: '123',
    });
    expect(result).toEqual({ message: 'auth.errors.passwordTooShort', field: 'password' });
  });

  it('rechaza passwords que no coinciden', () => {
    const result = validateRegisterCredentials({
      ...validCredentials,
      confirmPassword: 'otra-cosa',
    });
    expect(result).toEqual({ message: 'auth.errors.passwordMismatch', field: 'confirmPassword' });
  });
});
