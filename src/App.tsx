import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MatchPage } from './pages/MatchPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand-kicker">playSURE<span>stats</span></p>
          <h1>ClientAnalyse</h1>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Upload
          </NavLink>
          <NavLink to="/match" className={({ isActive }) => (isActive ? 'active' : '')}>
            Analyse match
          </NavLink>
        </nav>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match" element={<MatchPage />} />
        </Routes>
      </main>
    </div>
  );
}
