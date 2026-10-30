import { useState } from 'react';
import './style.css';
import useLoad from '../../hooks/useLoad';
import DocumentUpload from '../../components/DocumentUpload';
import DocumentReviewForm from '../../components/DocumentReviewForm';
import DocumentList from '../../components/DocumentList';
import type { DocumentItem, Investment, UploadResponse } from '../../types';

export default function Documents() {
  const [documents, reloadDocuments] = useLoad<DocumentItem[]>('/documentos');
  const [investments] = useLoad<Investment[]>('/investimentos');
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  return (
    <div className="documents-page">
      <h2>Importar documento</h2>
      <DocumentUpload onUploaded={r => { setUpload(r); reloadDocuments(); }} />
      {upload && (
        <DocumentReviewForm key={upload.documento.id_documento} upload={upload} investments={investments ?? []}
          onConfirmed={() => { setUpload(null); reloadDocuments(); }} />
      )}
      <DocumentList documents={documents} />
    </div>
  );
}
