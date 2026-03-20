import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCard } from '../components/UploadCard';
import { parseMatch } from '../lib/parser';
import { loadPayload, savePayload } from '../lib/storage';

export function HomePage() {
  const navigate = useNavigate();
  const existing = useMemo(() => loadPayload(), []);
  const [fileName, setFileName] = useState<string | null>(existing?.fileName ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      parseMatch(json);
      savePayload(file.name, json);
      setFileName(file.name);
      navigate('/match');
    } catch {
      setError("Le fichier JSON n'a pas pu être lu.");
    }
  };

  return (
    <div className="grid gap-5">
      <UploadCard onFile={handleFile} fileName={fileName} />

      <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-6 shadow-panel backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Fonctionnement</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Version client légère</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {['1 JSON unique', '1 joueur sélectionné', 'Vue globale + round', 'Persistance locale 24h'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
              {item}
            </div>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </section>
    </div>
  );
}
