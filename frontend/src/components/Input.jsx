// Input.jsx
export default function Input({
  label,
  value,
  onChange,
  type = "text", // default to normal text
  placeholder = "",
  multiline = false, // if true → textarea instead of input
  rows = 4, // default rows for textarea
  className = "",
}) {
  const baseStyles =
    "w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring focus:border-gray-400";

  return (
    <div>
      {label && <label className="block mb-1 font-medium">{label}</label>}

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${baseStyles} ${className}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseStyles} ${className}`}
        />
      )}
    </div>
  );
}
