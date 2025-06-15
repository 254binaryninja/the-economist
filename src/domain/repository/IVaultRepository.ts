import { Tables,TablesInsert,TablesUpdate } from '@/types/database';

export type Vault = Tables<'vault'>;
export type VaultInsert = TablesInsert<'vault'>;
export type VaultUpdate = TablesUpdate<'vault'>;

export interface IVaultRepository {
    setToken(token: string): Promise<void>;
    getByUserId(userId: string): Promise<Vault[]>;
    findById(id: string): Promise<Vault | null>;
    create(vault: VaultInsert): Promise<Vault>;
    update(id: string, vault: VaultUpdate): Promise<Vault | null>;
    delete(id: string): Promise<void>;
}
