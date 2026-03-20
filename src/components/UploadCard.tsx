import { useRef } from 'react';

export function UploadCard({
  onFile,
  fileName,
}: {
  onFile: (file: File) => void;
  fileName: string | null;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  return (
    <section className="panel upload-panel">
      <div>
        <p className="eyebrow">Étape 1</p>
        <h2>Uploader un seul JSON de match</h2>
        <p className="muted">
          Le fichier reste disponible 24h dans le navigateur pour pouvoir changer de page sans perdre l'analyse.
        </p>
      </div>

      <button className="primary-btn" onClick={() => ref.current?.click()}>
        Choisir un fichier JSON
      </button>

      <input
        ref={ref}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />

      <div className="file-pill">Fichier actuel : {fileName ?? 'aucun'}</div>
    </section>
  );
}
