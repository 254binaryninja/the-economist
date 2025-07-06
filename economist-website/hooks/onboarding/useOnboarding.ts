import { UserInsert } from "@/src/domain/repository/IUserRepository";
import { useSession, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { formSchema } from "@/types/onboarding";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { clientContainer } from "@/src/config/client.inversify.config";
import { TYPES } from "@/src/config/types";
import { UserController } from "@/src/controllers/UserController";

export function useOnboarding() {
  // Get authentication data
  const { session } = useSession();
  const { user } = useUser();

  const userName = user?.fullName || "";
  // Get the controller from the DI container
  const userController = clientContainer.get<UserController>(
    TYPES.UserController,
  );

  // Get the router for navigation
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: userName,
      occupation: "",
      student: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Get the token from the session
      const token = await session?.getToken();
      if (!token) {
        toast.error(
          "Authentication token is not available. Please log in again.",
        );
        return;
      }
      // Prepare user data
      const userData: UserInsert = {
        id: uuidv4(),
        user_id: user?.id || "",
        name: data.userName,
        email: user?.emailAddresses[0].emailAddress || "",
        occupation: data.occupation,
        student: data.student,
      };

      // Call the controller to create the user
      await userController.create(userData, token);
      toast.success("Profile created successfully!");
      router.push("/workspace/new"); // Redirect to the new workspace page after successful creation
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Error creating user");
    }
  };

  return {
    form,
    userName,
    onSubmit,
  };
}
