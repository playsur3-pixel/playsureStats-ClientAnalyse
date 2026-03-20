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
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-6 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Étape 1</p>
      <h2 className="mt-2 text-3xl font-bold text-white">Uploader un seul JSON de match</h2>
      <p className="mt-3 max-w-3xl text-sm text-slate-300">
        Le fichier reste disponible 24h dans le navigateur pour pouvoir changer de page sans perdre l'analyse.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          onClick={() => ref.current?.click()}
        >
          Choisir un fichier JSON
        </button>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          Fichier actuel : <span className="font-medium text-white">{fileName ?? 'aucun'}</span>
        </div>
      </div>

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
    </section>
  );
}
