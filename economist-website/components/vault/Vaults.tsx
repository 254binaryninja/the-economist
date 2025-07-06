"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useVault } from "@/hooks/vault/useVault";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ErrorState from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Vaults() {
  const {
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
  } = useVault();
  const router = useRouter();

  // Fetch Vaults on mount
  useEffect(() => {
    fetchVaults();
  }, []);

  if (error) {
    return (
      <div className="px-4">
        <ErrorState
          error={error}
          onRetry={fetchVaults}
          fullScreen={false}
          showBackButton={false}
        />
      </div>
    );
  }

  const handleNavigationToVault = useCallback(
    (id: string) => {
      router.push(`/vault/${id}`);
    },
    [router],
  );
  return (
    <div>
      <div className="flex items-center justify-between px-4">
        <SidebarGroupLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Vaults
        </SidebarGroupLabel>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => createVault()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="px-4 py-2 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : vaults.length > 0 ? (
        <SidebarGroupContent>
          <SidebarMenu>
            {vaults.map((vault, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <div
                    onClick={() => handleNavigationToVault(vault.id)}
                    className=""
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {vault.title}
                    </span>
                  </div>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200" />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-48 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                      onClick={() => {
                        setEditingVault(vault);
                        setNewVaultName(vault.title);
                      }}
                    >
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-200"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span>Delete Space</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the vault "
                            {vault.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVault(vault.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      ) : (
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <span className="text-gray-500 dark:text-gray-400 mb-2">
                  No workspaces found
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => createVault()}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Vault</span>
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      )}

      {/* Edit Vault Dialog */}
      <Dialog open={!!editingVault} onOpenChange={() => setEditingVault(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vault</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="spaceName">Workspace Name</Label>
              <Input
                id="spaceName"
                value={newVaultName}
                onChange={(e) => setNewVaultName(e.target.value)}
                placeholder="Enter space name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVault(null)}>
              Cancel
            </Button>
            <Button onClick={editVault}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
