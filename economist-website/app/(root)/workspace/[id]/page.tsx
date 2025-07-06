import WorkspaceChat from "@/components/ai/Chat";
import { serverContainer } from "@/src/config/inversify.config";
import { TYPES } from "@/src/config/types";
import { WorkspaceController } from "@/src/controllers/WorkspaceController";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for this page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { id: workspaceId } = await params;

    // Get authenticated user
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return {
        title: "Workspace - The Economist",
        description: "Economic analysis workspace",
      };
    }

    // Get workspace controller from DI container
    const workspaceController = serverContainer.get<WorkspaceController>(
      TYPES.WorkspaceController,
    );

    // Fetch workspace details
    const workspace = await workspaceController.findById(workspaceId, token);

    if (!workspace) {
      return {
        title: "Workspace Not Found - The Economist",
        description: "The requested workspace could not be found",
      };
    }

    return {
      title: `${workspace.title} - The Economist`,
      description: `Economic analysis workspace: ${workspace.title}`,
      openGraph: {
        title: `${workspace.title} - The Economist`,
        description: `Economic analysis workspace: ${workspace.title}`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Workspace - The Economist",
      description: "Economic analysis workspace",
    };
  }
}

export default async function WorkspacePage({ params }: PageProps) {
  const { id: workspaceId } = await params;

  // Get authenticated user
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    notFound();
  }

  // Get workspace controller from DI container
  const workspaceController = serverContainer.get<WorkspaceController>(
    TYPES.WorkspaceController,
  );

  // Fetch workspace details
  let workspace;
  try {
    workspace = await workspaceController.findById(workspaceId, token);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    notFound();
  }

  if (!workspace) {
    notFound();
  }

  return (
    <div className="">
      <div className="">
        <WorkspaceChat workspaceId={workspaceId} initialSystemMode="normal" />
      </div>
    </div>
  );
}
