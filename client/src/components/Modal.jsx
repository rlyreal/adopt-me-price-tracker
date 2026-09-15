import { X } from 'lucide-react'

export default function Modal({ title, eyebrow, children, onClose }) {
  const isConfirmation = children?.props?.pet?.__logout
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal-panel"><div className="flex items-start justify-between border-b border-ink/10 p-5 sm:p-7"><div><p className="eyebrow">{isConfirmation ? 'Confirm action' : eyebrow}</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">{isConfirmation ? 'Log out?' : title}</h2></div><button className="icon-button" onClick={onClose} title="Close"><X size={19} /></button></div><div className="p-5 sm:p-7">{children}</div></div></div>
}
