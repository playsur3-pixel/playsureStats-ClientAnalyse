import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MatchPage } from './pages/MatchPage';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full border px-4 py-2 text-sm transition',
    isActive
      ? 'border-orange-400 bg-orange-500 text-white'
      : 'border-white/10 bg-white/5 text-slate-200 hover:border-orange-300/50 hover:bg-white/10',
  ].join(' ');

export default function App() {
  return (
    <div className="min-h-screen px-4 py-5 text-slate-100 md:px-6">
      <header className="mx-auto mb-5 flex max-w-7xl flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-5 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-white">
            playSURE<span className="text-orange-500">stats</span>
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100">ClientAnalyse</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          <NavLink to="/" end className={linkClass}>
            Upload
          </NavLink>
          <NavLink to="/match" className={linkClass}>
            Analyse match
          </NavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match" element={<MatchPage />} />
        </Routes>
      </main>
    </div>
  );
}
