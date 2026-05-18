export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPassword = (password: string): boolean => password.length >= 6;

export const isValidFullName = (name: string): boolean => name.trim().length >= 2;

export const doPasswordsMatch = (password: string, confirmPassword: string): boolean =>
  password === confirmPassword;
