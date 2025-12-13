// src/app/core/models/user.model.ts
export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  roles: string[];
  applicantProfile?: {
    id: string;
    isComplete: boolean;
    completionPercentage: number;
  };
  employerProfile?: {
    id: string;
    isComplete: boolean;
    completionPercentage: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}