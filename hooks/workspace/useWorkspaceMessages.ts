import { useState } from "react";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { WorkspaceMessagesController } from "@/src/controllers/WorkspaceMesssagesController";
import { useSession, useAuth } from "@clerk/nextjs";
import { WorkspaceMessage } from "@/src/domain/repository/IWorkspaceMessagesRepository";
import { toast } from "sonner";



export function useWorkspaceMessages(workspaceId: string) {
    // Get authentication data
    const { session } = useSession();
    const { isSignedIn, isLoaded } = useAuth();

    // Get the controller from the DI container
    const workspaceMessagesController = clientContainer.get<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController);

    // Get the states
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);    //Toggle upvoting
    const toggleUpvoting = async(id: string, voteType: 'upvote' | 'downvote') => {
      try {
         const token = await session?.getToken();
         if(!token) {
            toast.error("Token not found");
            return;
         }

         // Find the current message to get its current upvote status
         const currentMessage = messages.find(m => m.id === id);
         if (!currentMessage) {
            toast.error("Message not found");
            return;
         }

         let newUpvoteStatus: boolean | null;
         
         if (voteType === 'upvote') {
           // If already upvoted, remove upvote (null), otherwise upvote (true)
           newUpvoteStatus = currentMessage.is_upvoted === true ? null : true;
         } else {
           // If already downvoted, remove downvote (null), otherwise downvote (false)  
           newUpvoteStatus = currentMessage.is_upvoted === false ? null : false;
         }         // Update the message in the database
         await workspaceMessagesController.updateMessageInWorkspace(
            id,
            {
              is_upvoted: newUpvoteStatus
            },
            token
         );

         // Update local state optimistically
         setMessages(prev => prev.map(msg => 
           msg.id === id 
             ? { ...msg, is_upvoted: newUpvoteStatus }
             : msg
         ));

         if (newUpvoteStatus === true) {
           toast.success("Message upvoted!");
         } else if (newUpvoteStatus === false) {
           toast.success("Message downvoted!");
         } else {
           toast.success("Vote removed");
         }
      } catch (e) {
        toast.error("Failed to vote");
        console.error("Failed to toggle vote:", e);
      }
    };

    // Fetch Messages
    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignedIn && isLoaded) { 
                const token = await session?.getToken();
                if(!token) {
                    toast.error("Token not found")
                    setError("Token not found")
                    return;
                }
                const fetchedMessages = await workspaceMessagesController.getMessagesByWorkspaceId(workspaceId, token);
                setMessages(fetchedMessages);
            }
        } catch (err) {
            toast.error("Failed to fetch messages")
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };    return {
        messages,
        loading,
        error,
        fetchMessages,
        toggleUpvoting
    }
}