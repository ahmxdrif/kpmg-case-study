function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 12,
          padding: 24,
          width: '90%',
          maxWidth: 480,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;