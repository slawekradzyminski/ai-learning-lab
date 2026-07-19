import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

function AppCanvas() {
  const location = useLocation();
  const presenting = new URLSearchParams(location.search).get('view') === 'present';
  return (
    <main className={presenting ? 'min-h-screen p-2' : 'mx-auto min-h-screen w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7'}>
      <AppRoutes />
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppCanvas />
    </BrowserRouter>
  );
}
