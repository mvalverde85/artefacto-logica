import { useState } from 'react';
import { X, Copy, Check, Link, Mail } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';

interface Props { onClose: () => void; }

export default function ShareModal({ onClose }: Props) {
  const { board } = useBoardStore();
  const link = `https://mathboard.studio/board/${board.id}`;
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('edit');
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);

  const copyLink = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const sendInvite = () => { if (email) { setInvited(true); setTimeout(() => setInvited(false), 2000); setEmail(''); } };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Compartir pizarra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Link size={14} /> Enlace de acceso</p>
            <div className="flex gap-2">
              <input readOnly value={link} className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500" onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={copyLink} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Permisos del enlace</p>
            <div className="flex gap-2">
              {(['view', 'comment', 'edit'] as const).map((p) => (
                <button key={p} onClick={() => setPermission(p)} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${permission === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p === 'view' ? 'Solo leer' : p === 'comment' ? 'Comentar' : 'Editar'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5"><Mail size={14} /> Invitar por correo</p>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" onKeyDown={(e) => { if (e.key === 'Enter') sendInvite(); }} />
              <button onClick={sendInvite} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${invited ? 'bg-green-100 text-green-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>{invited ? 'Enviado ✓' : 'Invitar'}</button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 font-medium">Listo</button>
        </div>
      </div>
    </div>
  );
}
