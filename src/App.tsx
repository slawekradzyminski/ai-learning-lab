import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}
