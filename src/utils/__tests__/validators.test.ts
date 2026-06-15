import { isValidEmail, isValidPassword, isValidFullName, doPasswordsMatch } from '../validators';

describe('validators utility tests', () => {
  describe('isValidEmail', () => {
    it('debe retornar true para un email válido', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail(' user.name+tag@sub.domain.co ')).toBe(true);
    });

    it('debe retornar false para un email inválido', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('debe retornar true para contraseñas de al menos 6 caracteres', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('aLongPasswordWithSpecialChars!@#')).toBe(true);
    });

    it('debe retornar false para contraseñas menores a 6 caracteres', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('isValidFullName', () => {
    it('debe retornar true para nombres válidos con al menos 2 caracteres después de quitar espacios', () => {
      expect(isValidFullName('John Doe')).toBe(true);
      expect(isValidFullName(' Ab ')).toBe(true);
    });

    it('debe retornar false para nombres inválidos', () => {
      expect(isValidFullName('A')).toBe(false);
      expect(isValidFullName('   ')).toBe(false);
      expect(isValidFullName('')).toBe(false);
    });
  });

  describe('doPasswordsMatch', () => {
    it('debe retornar true cuando las contraseñas coinciden', () => {
      expect(doPasswordsMatch('password123', 'password123')).toBe(true);
    });

    it('debe retornar false cuando las contraseñas no coinciden', () => {
      expect(doPasswordsMatch('password123', 'different123')).toBe(false);
    });
  });
});
