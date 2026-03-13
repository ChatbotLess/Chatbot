import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Chat } from './pages/chat/Chat';
import { Login } from './pages/login/Login';
import { Sidebar } from './components/Sidebar';


export function RoutesApp() {
  return (
    <BrowserRouter>
      <div className="flex flex h-[100vh] bg-gray-950">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path='/' element={<Chat />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}