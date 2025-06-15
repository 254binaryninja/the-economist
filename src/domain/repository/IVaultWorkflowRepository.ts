import { Tables,TablesInsert,TablesUpdate } from "@/types/database";

export type VaultWorkflow = Tables<'vault_workflows'>;
export type VaultWorkflowInsert = TablesInsert<'vault_workflows'>;
export type VaultWorkflowUpdate = TablesUpdate<'vault_workflows'>;

export interface IVaultWorkflowRepository {
    setToken(token: string): Promise<void>;
    getByVaultId(vaultId: string): Promise<VaultWorkflow[]>;
    findById(id: string): Promise<VaultWorkflow | null>;
    create(vaultWorkflow: VaultWorkflowInsert): Promise<VaultWorkflow>;
    update(id: string, vaultWorkflow: VaultWorkflowUpdate): Promise<VaultWorkflow | null>;
    delete(id: string): Promise<void>;
}
