import { useState } from 'react';
import type { ChangeEvent } from 'react';
import './style.css';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import type { UploadResponse } from '../../types';

export default function DocumentUpload({ onUploaded }: { onUploaded: (r: UploadResponse) => void }) {
  const [busy, setBusy] = useState(false);
  const choose = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('ficheiro', file);
    setBusy(true);
    run(async () => onUploaded(await api<UploadResponse>('/documentos', { method: 'POST', form })))
      .then(() => setBusy(false));
    e.target.value = '';
  };
  return (
    <div className="card">
      <p>Carregue uma fotografia de uma fatura. O texto é extraído por OCR e <b>só é registado depois de o confirmar</b>.</p>
      <input type="file" accept="image/*" onChange={choose} />
      {busy && <p className="muted upload-busy">A ler o documento…</p>}
    </div>
  );
}
