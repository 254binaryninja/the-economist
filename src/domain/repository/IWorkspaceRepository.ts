import {  Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Workspace = Tables<'workspaces'>;
export type WorkspaceInsert = TablesInsert<'workspaces'>;  
export type WorkspaceUpdate = TablesUpdate<'workspaces'>;

export interface IWorkspaceRepository {
    setToken(token: string): Promise<void>;
    getByUserId(userId: string): Promise<Workspace[]>;
    findById(id: string): Promise<Workspace | null>;
    findByName(name: string): Promise<Workspace | null>;
    create(workspace: WorkspaceInsert): Promise<Workspace>;
    update(id: string, workspace: WorkspaceUpdate): Promise<Workspace | null>;
    delete(id: string): Promise<void>;
}