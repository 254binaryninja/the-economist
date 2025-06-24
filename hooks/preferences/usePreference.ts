import { useSession, useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/store/UserStore";

export function usePreferences() {
  // Get auth data
  const { session } = useSession();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const user_id = user?.id;

  const { id, verbosity, style, fetchUserData, updateUserData } =
    useUserStore();

  //Initialize the states
  const [verbosityState, setVerbosityState] = useState(
    parseFloat(verbosity ?? "0.2") || 0.2,
  );
  const [styleState, setStyleState] = useState(parseInt(style ?? "10") || 33);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isSignedIn || !isLoaded) {
      toast.error("Must sign in to access data");
      return;
    }

    const token = await session?.getToken();

    if (!user_id || !token) {
      toast.error("Error occured getting Auth credentials");
      return;
    }
    try {
      await fetchUserData(token, user_id);
    } catch (e) {
      console.error("Error loading user data:", e); //TODO: Remove console log
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [user_id, session]);

  // Handle saving preferences
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await session?.getToken();
      if (!token) {
        toast.error("Authentication token not found");
        setIsSaving(false);
        return;
      }

      // Check if we have a user ID
      if (!id) {
        toast.error("User ID not found. Please refresh the page.");
        setIsSaving(false);
        return;
      }

      console.log("Saving preferences for user ID:", id);

      await updateUserData(
        {
          verbosity: verbosityState.toString(),
          style: styleState.toString(),
        },
        token,
      );
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    verbosity,
    style,
    id,
    verbosityState,
    setVerbosityState,
    styleState,
    setStyleState,
    isLoading,
    isSaving,
    loadData,
    handleSave,
  };
}
