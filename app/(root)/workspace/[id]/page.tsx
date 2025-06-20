

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { id: workspaceId } = await params;

  return (
    <div className="h-full flex flex-col">
      
      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        
      </div>
    </div>
  );
}