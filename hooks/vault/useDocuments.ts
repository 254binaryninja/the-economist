/***
 * Custom hook to manage document-related operations within a vault.
 * Loads vault documents, handles document uploads, and provides functions
 * for managing document state.
 * @returns {Object} - The document management functions and state.
 */


import { useState } from "react";
import { container } from "@/src/config/inversify.config";
import { TYPES } from "@/src/config/types";
import { VaultDocumentController } from "@/src/controllers/VaultDocumentController";
import { useSession,useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { VaultDocument } from "@/src/domain/repository/IVaultDocumentRepository";


export function useVaultDocuments ( vaultID : string ) {
    // Get authentication data
    const { session } = useSession();
    const { isSignedIn,isLoaded } = useAuth();

    // Get the controller from the DI container
    const vaultDocumentController = container.get<VaultDocumentController>(TYPES.VaultDocumentController)

     // Get the states
     const [ documents,setDocuments ] = useState<VaultDocument[]>([]);
     const [ loading,setLoading ] = useState<boolean>(false);
     const [ error,setError ] = useState<string | null>(null);

    // Fetch Documents
    const fetchDocuments = async()=> {
       setLoading(true)
       setError(null)
       try{
         if( isSignedIn && isLoaded ) {
            const token = await session?.getToken();
            if(!token) {
                toast.error("Token is not available")
                return;
            }
            const fetchDocuments = await vaultDocumentController.getByVaultId(vaultID,token)
            setDocuments(fetchDocuments)
         } else {
           toast.error("User is not signed in or session is not loaded");
           return;
         }
       } catch(err) {
         setError(err instanceof Error ? err.message : "An unexpected error occurred");
         toast.error('An unexpected error occurred')
       }
       finally {
        setLoading(false)
       }
    }
      // Upload Document to API endpoint you can upload a file or a url link
    const uploadDocument = async (fileOrUrl: File | string, documentType?: string) => {
        setLoading(true);
        setError(null);
        
        try {
            if (!isSignedIn || !isLoaded) {
                toast.error("User is not signed in or session is not loaded");
                return;
            }

            const token = await session?.getToken();
            if (!token) {
                toast.error("Token is not available");
                setError("Token is not available");
                return;
            }

            const formData = new FormData();

            // Handle file upload
            if (fileOrUrl instanceof File) {
                formData.append('file', fileOrUrl);
                // Auto-detect document type from file extension if not provided
                if (!documentType) {
                    const extension = fileOrUrl.name.split('.').pop()?.toLowerCase();
                    switch (extension) {
                        case 'pdf':
                            documentType = 'pdf';
                            break;
                        case 'docx':
                        case 'doc':
                            documentType = 'docx';
                            break;
                        case 'xlsx':
                        case 'xls':
                            documentType = 'xlsx';
                            break;
                        case 'txt':
                            documentType = 'txt';
                            break;
                        case 'csv':
                            documentType = 'csv';
                            break;
                        default:
                            documentType = 'txt';
                    }
                }
                formData.append('documentType', documentType);
            } 
            // Handle URL input
            else if (typeof fileOrUrl === 'string') {
                formData.append('url', fileOrUrl);
                formData.append('documentType', documentType || 'url');
            } else {
                toast.error("Invalid input: must be a file or URL string");
                return;
            }

            const response = await fetch(`/api/vault/${vaultID}/documents`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to upload document');
            }

            if (result.success) {
                toast.success(`Document "${result.data.documentName}" uploaded successfully`);
                // Refresh documents list
                await fetchDocuments();
                return result.data;
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            toast.error(`Upload failed: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }    // Delete Document
    const deleteDocument = async (documentId: string) => {
        setLoading(true);
        setError(null);

        try {
            if (!isSignedIn || !isLoaded) {
                toast.error("User is not signed in or session is not loaded");
                return;
            }

            const token = await session?.getToken();
            if (!token) {
                toast.error("Token is not available");
                setError("Token is not available");
                return;
            }

            const response = await fetch(`/api/vault/${vaultID}/documents/${documentId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete document');
            }

            if (result.success) {
                toast.success('Document deleted successfully');
                // Remove document from local state
                setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            } else {
                throw new Error(result.error || 'Delete failed');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            toast.error(`Delete failed: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return {
      documents,
      loading,
      error,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
    }
}