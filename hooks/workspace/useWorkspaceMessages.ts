import { useState } from "react";
import { container } from "@/src/config/inversify.config";
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
    const workspaceMessagesController = container.get<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController);

    // Get the states
    const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
    };

    return {
        messages,
        loading,
        error,
        fetchMessages
    }
}