import { lazy } from 'solid-js';
import {
  Routes,
  Route,
  Navigate,
  A,
} from '@solidjs/router';

const Hanoi = lazy(() => import('@src/pages/Hanoi'));
const TicTacToe = lazy(() => import('@src/pages/TicTacToe'));

function App() {
  return (
    <>
      <button
        data-drawer-target="sidebar"
        data-drawer-toggle="sidebar"
        aria-controls="sidebar"
        type="button"
        class="inline-flex items-center p-2 mt-4 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <span class="sr-only">Open sidebar</span>
        <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
        </svg>
      </button>

      <aside id="sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50">
          <A href="/" class="flex items-center mb-5 border-b border-gray-200">
            <span class="self-center text-xl font-semibold whitespace-nowrap">CS Games</span>
          </A>
          <nav class="space-y-2">
            <A href="/tower-of-hanoi" class="flex items-center p-2 ml-3 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100 underline">Tower of Hanoi</A>
            <A href="tic-tac-toe" class="flex items-center p-2 ml-3 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100 underline">Tic Tac Toe</A>
          </nav>
        </div>
      </aside>

      <div class="p-4 sm:ml-64">
        <Routes>
          <Route path="/tower-of-hanoi" component={Hanoi} />
          <Route path="/tic-tac-toe" component={TicTacToe} />
          <Route path="/" element={<Navigate href="/tower-of-hanoi" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
