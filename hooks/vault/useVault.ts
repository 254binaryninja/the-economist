import { VaultController } from "@/src/controllers/VaultController";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { use, useState } from "react";
import { useSession, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Vault, VaultInsert } from "@/src/domain/repository/IVaultRepository";
import { v4 as uuidv4 } from "uuid";

export function useVault() {
  // Get the session and auth from Clerk
  const { session } = useSession();
  const { isSignedIn, isLoaded } = useAuth();
  // Initialize the vault controller
  const vaultController = clientContainer.get<VaultController>(
    TYPES.VaultController,
  );

  // Get the states
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [newVaultName, setNewVaultName] = useState<string>("");

  // Function to fetch vaults
  const fetchVaults = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSignedIn && isLoaded) {
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
        const fetchedVaults = await vaultController.getByUserId(userId, token);
        setVaults(fetchedVaults);
      } else {
        toast.error("User is not signed in or session is not loaded");
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

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
      setVaults((prevVaults) =>
        prevVaults.filter((vault) => vault.id !== vaultId),
      );
      toast.success("Vault deleted successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit vault function
  const editVault = async () => {
    setLoading(true);
    setError(null);
    if (!editingVault || !newVaultName) return;
    try {
      const token = await session?.getToken();
      if (!token) {
        toast.error("Token not available");
        setError("Token is not available");
        return;
      }
      const updatedVault = await vaultController.update(
        editingVault?.id,
        {
          title: newVaultName,
        },
        token,
      );
      setVaults((prevVaults) =>
        prevVaults.map((vault) =>
          vault.id === editingVault.id ? { ...vault, ...updatedVault } : vault,
        ),
      );
      toast.success("Vault updated successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const createVault = async (vaultTitle?: string) => {
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
      const title = vaultTitle || `New Vault ${vaults.length + 1}`;
      const createdVault = await vaultController.create(
        { id, user_id, title },
        token,
      );
      setVaults((prevVaults) => [...prevVaults, createdVault]);
      toast.success("Vault created successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };
  return {
    vaults,
    loading,
    error,
    editingVault,
    newVaultName,
    setNewVaultName,
    setEditingVault,
    createVault,
    fetchVaults,
    deleteVault,
    editVault,
  };
}
