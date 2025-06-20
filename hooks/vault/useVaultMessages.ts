import { useState } from "react";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { VaultMessagesController } from "@/src/controllers/VaultMessagesController";
import { useSession, useAuth } from "@clerk/nextjs";
import { WorkspaceMessage } from "@/src/domain/repository/IWorkspaceMessagesRepository";
import { toast } from "sonner";
import { VaultMessage } from "@/src/domain/repository/IVaultMessagesRepository";



export function useVaultMessages( vaultId : string ) {
  //Get authentication data
   const { session } = useSession();
   const  { isSignedIn,isLoaded } = useAuth();

   // Get controller from DI container 
   const vaultMesssagesController = clientContainer.get<VaultMessagesController>(TYPES.VaultMessagesController)

   // Get states
   const [ messages,setMessages ] = useState<VaultMessage[]>([])
   const [ loading,setLoading ] = useState<boolean>(false)
   const [ error,setError ] = useState<string | null>(null)


   // Fetch messages
   const fetchMessages = async () => {
       setLoading(true);
       setError(null);
       try {
           if (isSignedIn && isLoaded) {
               const token = await session?.getToken();
               if (!token) {
                   toast.error("Token not found");
                   setError("Token not found");
                   return;
               }
               const fetchedMessages = await vaultMesssagesController.getMessagesByVaultId(vaultId, token);
               setMessages(fetchedMessages);
           }
       } catch (err) {
           toast.error("Failed to fetch messages");
           setError(err instanceof Error ? err.message : "An unexpected error occurred");
       } finally {
           setLoading(false);
       }
   };

   return {
       messages,
       loading,
       error,
       fetchMessages
   }
}