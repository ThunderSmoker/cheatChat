import Chat from './component/Chat';

const Home = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-600">CheatChat</h1>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-5 py-2 rounded-full shadow-sm border border-gray-300 font-medium flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Global Workspace
          </div>
        </div>
        <Chat workspaceId="global" />
      </div>
    </main>
  );
};

export default Home;
