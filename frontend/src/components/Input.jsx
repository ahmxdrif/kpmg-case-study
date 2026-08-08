function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default Input;