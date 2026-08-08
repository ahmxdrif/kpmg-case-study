function Card({ children, style = {} }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;