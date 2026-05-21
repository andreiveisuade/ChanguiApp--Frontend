export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthError = {
  message: string;
  field?: keyof RegisterCredentials | 'general';
};

export type AuthSession = {
  token: string;
  user: User;
};
