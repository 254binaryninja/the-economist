import { WorkspaceController } from "@/src/controllers/WorkspaceController";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { useState } from "react";
import { Workspace } from "@/src/domain/repository/IWorkspaceRepository";
import { useSession,useAuth } from "@clerk/nextjs";
import { toast } from 'sonner'
import  { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";


export function useWorkspace() {

    //Get the session and auth from Clerk
    const { session } = useSession();
    const { isSignedIn,isLoaded } = useAuth();
    // Initialize the workspace controller
    const workspaceController = clientContainer.get<WorkspaceController>(TYPES.WorkspaceController);

    const router = useRouter();

    // Get the states
    const [ workspaces,setWorkspaces ] = useState<Workspace[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ editingWorkspace, setEditingWorkspace ] = useState<Workspace | null>(null);
    const [ newWorkspaceName, setNewWorkspaceName ] = useState<string>("");

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
            router.push("/workspace/new");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Edit workspace function
    const editWorkspace = async () => {
        setLoading(true);
        setError(null);
        if( !editingWorkspace || !newWorkspaceName ) return;
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
            const updatedWorkspace = await workspaceController.update(editingWorkspace?.id, {
                title: newWorkspaceName,
            }, token);
            setWorkspaces(prevSpaces => prevSpaces.map(ws =>
                ws.id === editingWorkspace.id  ? updatedWorkspace! : ws
            ))
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }    };

    // Create a new workspace
    const createWorkspace = async ( workspaceTitle?:string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const user_id = session?.user.id;
            const id = uuidv4();
            if (!user_id) {
                toast.error("User ID is not available");
                setError("User ID not available");
                return null;
            }
            if (!token) {
                toast.error("Token is not available");
                setError("Token not available");
                return null;
            }

            const title = workspaceTitle || `New Space ${workspaces.length + 1}`;
            const createdWorkspace = await workspaceController.create({id,title,user_id}, token);
            setWorkspaces((prev) => [...prev, createdWorkspace]);
            return createdWorkspace.id; // Return the workspace ID
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        workspaces,
        loading,
        error,
        editingWorkspace,
        newWorkspaceName,
        setNewWorkspaceName,
        setEditingWorkspace,
        createWorkspace,
        fetchWorkspaces,
        deleteWorkspace,
        editWorkspace
    }
}