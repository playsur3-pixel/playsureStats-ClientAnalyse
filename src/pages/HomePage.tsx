import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCard } from '../components/UploadCard';
import { loadPayload, savePayload } from '../lib/storage';
import { parseMatch } from '../lib/parser';

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
      setError('Le fichier JSON n\'a pas pu être lu.');
    }
  };

  return (
    <div className="stack-lg">
      <UploadCard onFile={handleFile} fileName={fileName} />

      <section className="panel">
        <p className="eyebrow">Fonctionnement</p>
        <h2>Version client légère</h2>
        <div className="bulletless-grid">
          <div className="mini-card">1 JSON unique</div>
          <div className="mini-card">1 joueur sélectionné</div>
          <div className="mini-card">Vue globale + round</div>
          <div className="mini-card">Persistance locale 24h</div>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </div>
  );
}
