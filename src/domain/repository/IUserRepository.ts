import { Tables,TablesInsert,TablesUpdate } from '@/types/database';

export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;


export interface IUserRepository {
    setToken(token: string): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: UserInsert): Promise<User>;
    update(id: string, user: UserUpdate): Promise<User | null>;
    delete(id: string): Promise<void>;
}