import { VaultController } from "@/src/controllers/VaultController"
import { container } from "@/src/config/inversify.config";
import { TYPES } from "@/src/config/types";
import { use, useState } from "react";
import { useSession,useAuth } from "@clerk/nextjs";
import { toast } from 'sonner'
import { Vault, VaultInsert } from "@/src/domain/repository/IVaultRepository";
import  { v4 as uuidv4 } from 'uuid';


export function useVault () {
    // Get the session and auth from Clerk
    const { session } = useSession();
    const { isSignedIn, isLoaded } = useAuth();
    // Initialize the vault controller
    const vaultController = container.get<VaultController>(TYPES.VaultController);

    // Get the states
    const [ vaults, setVaults ] = useState<Vault[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    // Function to fetch vaults
    const fetchVaults = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignedIn && isLoaded) {
                const token = await session?.getToken();
                const userId = session?.user.id;
                if (!userId) {
                    toast.error("User ID is not available")
                    setError("User ID is not available")
                    return;
                }
                if (!token) {
                    toast.error("Token is not available");
                    setError("Token is not available")
                    return;
                }
                const fetchedVaults = await vaultController.getByUserId(userId, token);
                setVaults(fetchedVaults);
            } else {
                toast.error("User is not signed in or session is not loaded");
                return;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    // Delete vault function
    const deleteVault = async (vaultId: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const userId = session?.user.id;
            if (!userId) {
                toast.error("User ID is not available");
                setError("User ID is not available");
                return;
            }
            if (!token) {
                toast.error("Token is not available");
                setError("Token is not available");
                return;
            }
            await vaultController.delete(vaultId, token);
            setVaults(prevVaults => prevVaults.filter(vault => vault.id !== vaultId));
            toast.success("Vault deleted successfully");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    // Edit vault function
    const editVault = async (vaultId: string, updatedVault: Partial<Vault>) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            if (!token) {
                toast.error("Token not available")
                setError("Token is not available")
                return;
            }
            await vaultController.update(vaultId, updatedVault, token);
            setVaults(prevVaults => prevVaults.map(vault => vault.id === vaultId ? { ...vault, ...updatedVault } : vault));
            toast.success("Vault updated successfully");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    const createVault = async (newVault: VaultInsert) => {
        setLoading(true);
        setError(null);
        try {
            const token = await session?.getToken();
            const user_id = session?.user.id;
            const id = uuidv4();
            if (!user_id) {
                throw new Error("User ID is not available");
            }
            if (!token) {
                throw new Error("Token is not available");
            }
            const createdVault = await vaultController.create({ ...newVault, user_id ,id}, token);
            setVaults(prevVaults => [...prevVaults, createdVault]);
            toast.success("Vault created successfully");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }
    return {
        vaults,
        loading,
        error,
        fetchVaults,
        deleteVault,
        editVault
    }
}