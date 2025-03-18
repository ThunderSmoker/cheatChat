import Chat from './component/Chat';

const Home = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-600">CheatChat</h1>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-full shadow-md border border-purple-400 font-medium flex items-center gap-2 hover:shadow-lg hover:scale-105 hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="relative">
              Global Workspace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </span>
          </div>
        </div>
        <Chat workspaceId="global" />
      </div>
    </main>
  );
};

export default Home;
