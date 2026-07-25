import { useEffect } from 'react';
import { RouterProvider, Routes } from './lib/router';
import { usePuterStore } from './lib/puter';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ResumePage from './pages/ResumePage';

function AppInner() {
  const { init } = usePuterStore();
  useEffect(() => { init(); }, []);

  return (
    <Routes
      routes={[
        { path: '/', component: Home },
        { path: '/auth', component: Auth },
        { path: '/upload', component: Upload },
        { path: '/resume/:id', component: ResumePage },
      ]}
    />
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppInner />
    </RouterProvider>
  );
}
