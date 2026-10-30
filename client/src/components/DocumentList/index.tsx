import './style.css';
import DataTable from '../DataTable';
import type { Column } from '../DataTable';
import type { DocumentItem } from '../../types';

const columns: Column<DocumentItem>[] = [
  { header: 'Ficheiro', render: d => d.nome_ficheiro },
  { header: 'Estado', render: d => <span className={`doc-state ${d.estado_processamento}`}>{d.estado_processamento}</span> },
  { header: 'Data', render: d => d.data_importacao.slice(0, 10) },
];

export default function DocumentList({ documents }: { documents: DocumentItem[] | null }) {
  return <DataTable columns={columns} rows={documents} getKey={d => d.id_documento} empty="Ainda não importou documentos." />;
}
