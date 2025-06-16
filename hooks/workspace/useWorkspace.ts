import { WorkspaceController } from "@/src/controllers/WorkspaceController";
import { container } from "@/src/config/inversify.config";
import { TYPES } from "@/src/config/types";
import { use, useState } from "react";
import { Workspace, WorkspaceInsert } from "@/src/domain/repository/IWorkspaceRepository";
import { useSession,useAuth } from "@clerk/nextjs";
import { toast } from 'sonner'
import  { v4 as uuidv4 } from 'uuid';


export function useWorkspace() {

    //Get the session and auth from Clerk
    const { session } = useSession();
    const { isSignedIn,isLoaded } = useAuth();
    // Initialize the workspace controller
    const workspaceController = container.get<WorkspaceController>(TYPES.WorkspaceController);

    // Get the states
    const [ workspaces,setWorkspaces ] = useState<Workspace[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    // Function to fetch workspaces
    const fetchWorkspaces = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignedIn && isLoaded) {
                const token = await session?.getToken();
                const user_id = session?.user.id;
                if (!user_id) {
                    toast.error("User ID is not available");
                    setError("User ID not available");
                    return;
                }
                if (!token) {
                    toast.error("Token not available")
                    setError("Token not available")
                    return;
                }
                const fetchedWorkspaces = await workspaceController.getByUserId(user_id, token);
                setWorkspaces(fetchedWorkspaces);
            } else {
                toast.error("User is not signed in or session is not loaded");
                return;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Delete workspace function
    const deleteWorkspace = async (workspaceId: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const user_id = session?.user.id;
            if (!user_id) {
                toast.error("User ID is not available");
                setError("User ID not available");
                return;
            }
            if (!token) {
                toast.error("Token is not available");
                setError("Token is not available");
                return;
            }
            await workspaceController.delete(workspaceId, token);
            setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Edit workspace function
    const editWorkspace = async (workspaceId: string, updatedData: Partial<Workspace>) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const user_id = session?.user.id;
            if (!user_id) {
                toast.error("User ID is not available");
                setError("User ID not available");
                return;
            }
            if (!token) {
                toast.error("Token is not available");
                setError("Token is not available");
                return;
            }
            await workspaceController.update(workspaceId, updatedData, token);
            setWorkspaces((prev) => prev.map((ws) => (ws.id === workspaceId ? { ...ws, ...updatedData } : ws)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Create a new workspace 

    const createWorkspace = async (newWorkspace: WorkspaceInsert) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const user_id = session?.user.id;
            const id = uuidv4();
            if (!user_id) {
                toast.error("User ID is not available");
                setError("User ID not available");
                return;
            }
            if (!token) {
                toast.error("Token is not available");
                setError("Token not available");
                return;
            }
            const createdWorkspace = await workspaceController.create({ ...newWorkspace, user_id, id }, token);
            setWorkspaces((prev) => [...prev, createdWorkspace]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return {
        workspaces,
        loading,
        error,
        fetchWorkspaces,
        deleteWorkspace,
        editWorkspace
    }
}