import Chat from '../component/Chat';
import { notFound } from 'next/navigation';

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspacePage = ({ params }: WorkspacePageProps) => {
  // Validate workspaceId if needed
  if (!params.workspaceId) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-600">CheatChat</h1>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-5 py-2 rounded-full shadow-sm border border-blue-200 font-medium flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Workspace: {params.workspaceId}
          </div>
        </div>
        <Chat workspaceId={params.workspaceId} />
      </div>
    </main>
  );
};

export default WorkspacePage;
