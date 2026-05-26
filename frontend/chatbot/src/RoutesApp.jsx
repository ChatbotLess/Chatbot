import { useState } from 'react';
import { MdMenu, MdOutlineMessage } from 'react-icons/md';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { Chat } from './pages/chat/Chat';
import { NewChat } from './pages/chat/Newchat';
import { Login } from './pages/login/Login';
import { Signup } from './pages/signup/Signup';
import { ResetPassPage } from './pages/reset_password/ResetPassPage';
import { ResetPassPage2 } from './pages/reset_password/ResetPassPage2';
import { Dashboard } from './pages/dashboard/Dashboard';
import { FileUpload } from './pages/file_upload/FileUpload';
import { KnowledgeBase } from './pages/knowledge_base/KnowledgeBase';
import { NotFound } from './pages/NotFound';
import { Sidebar } from './components/Sidebar';
import PrivateRoute from './context/AuthProvider/privateRoute';
import PublicRoute from './context/AuthProvider/publicRoute';

function AppContent() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const validRoutes = ['/', '/chat', '/dashboard', '/upload', '/knowledge', '/login', '/signup'];
  const isValidRoute = validRoutes.includes(location.pathname) || location.pathname.startsWith('/chat/');
  const showSidebar = isValidRoute && !['/login', '/signup'].includes(location.pathname.toLowerCase()); 

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-950">
      {showSidebar && (
        <>
          <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-800 bg-gray-950/95 px-4 text-white backdrop-blur md:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              aria-label="Abrir menu"
            >
              <MdMenu size={22} />
            </button>
            <MdOutlineMessage className="text-xl" />
            <span className="text-sm font-semibold">Chatbot</span>
          </header>

          {isSidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fechar menu"
            />
          )}

          <div
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className={`min-w-0 flex-1 ${showSidebar ? "h-full pt-14 md:pt-0" : "h-full"}`}>
        <Routes>
          <Route path='/' element={
            <PrivateRoute>
              <NewChat />
            </PrivateRoute>
          } />
          <Route path='/chat' element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path='/chat/:conversationId' element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path='/dashboard' element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path='/upload' element={
            <PrivateRoute>
              <FileUpload />
            </PrivateRoute>
          } />
          <Route path='/knowledge' element={
            <PrivateRoute>
              <KnowledgeBase />
            </PrivateRoute>
          } />
          <Route path='/login' element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path='/signup' element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path='/reset' element={
            <PublicRoute>
              <ResetPassPage />
            </PublicRoute>
          } />
          <Route path='/reset-password' element={
            <PublicRoute>
              <ResetPassPage2 />
            </PublicRoute>
          } />
          <Route path='*' element={<NotFound />} />
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
