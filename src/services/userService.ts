// services/userService.ts
import { api } from '@/lib/api';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

// GET /private/user  — current authenticated user
export const getCurrentUser = (): Promise<User> =>
  api.get<User>('/private/user').then((r) => r.data);

// GET /private/users
export const getUsers = (): Promise<User[]> =>
  api.get<User[]>('/private/users').then((r) => r.data);

// POST /private/users
export const createUser = (dto: CreateUserDto): Promise<User> =>
  api.post<User>('/private/users', dto).then((r) => r.data);

// PATCH /private/user/me
export const updateUser = (dto: UpdateUserDto): Promise<User> =>
  api.patch<User>('/private/user/me', dto).then((r) => r.data);

// DELETE /private/user
export const deleteUser = (): Promise<void> =>
  api.delete('/private/user').then(() => undefined);