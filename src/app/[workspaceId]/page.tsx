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
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-full shadow-md border border-blue-400 font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="relative group">
              Workspace: <strong>{params.workspaceId}</strong> 
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </span>
          </div>
        </div>
        <Chat workspaceId={params.workspaceId} />
      </div>
    </main>
  );
};

export default WorkspacePage;
