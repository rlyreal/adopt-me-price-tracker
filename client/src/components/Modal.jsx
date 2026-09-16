import { X } from 'lucide-react'

export default function Modal({ title, eyebrow, children, onClose }) {
  const isConfirmation = children?.props?.pet?.__logout
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal-panel"><div className="flex items-start justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-6 sm:py-5"><div className="min-w-0"><p className="eyebrow">{isConfirmation ? 'Confirm action' : eyebrow}</p><h2 className="modal-title mt-1 font-display text-[1.6rem] font-bold leading-tight text-ink">{isConfirmation ? 'Exit?' : title}</h2></div><button className="icon-button shrink-0" onClick={onClose} title="Close"><X size={19} /></button></div><div className="px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6">{children}</div></div></div>
}
