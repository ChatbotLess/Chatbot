import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { Chat } from './pages/chat/Chat';
import { NewChat } from './pages/chat/Newchat';
import { Login } from './pages/login/Login';
import { Signup } from './pages/signup/Signup';
import { Sidebar } from './components/Sidebar';

function AppContent() {
  const location = useLocation();
  const showSidebar = !['/login', '/signup'].includes(location.pathname.toLowerCase()); 

  return (
    <div className="flex h-[100vh] bg-gray-950">
      {showSidebar && <Sidebar />}
      <main className="flex-1">
        <Routes>
          <Route path='/' element={<NewChat />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/chat/:conversationId' element={<Chat />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}

export function RoutesApp() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}