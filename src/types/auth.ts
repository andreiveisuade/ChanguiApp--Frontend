export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type RegisterCredentials = {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthError = {
  message: string;
  field?: keyof RegisterCredentials | 'general';
};

export type AuthSession = {
  token: string;
  user: User;
};
