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
  const validRoutes = ['/', '/chat', '/dashboard', '/upload', '/base-conhecimento', '/login', '/signup'];
  const isValidRoute = validRoutes.includes(location.pathname) || location.pathname.startsWith('/chat/');
  const showSidebar = isValidRoute && !['/login', '/signup'].includes(location.pathname.toLowerCase()); 

  return (
    <div className="flex h-[100vh] bg-gray-950">
      {showSidebar && <Sidebar />}
      <main className="flex-1">
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
          <Route path='/base-conhecimento' element={
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
