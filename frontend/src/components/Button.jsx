// Button.jsx
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "default", // default style
  className = "",
}) {
  // Define styles for each variant
  const variants = {
    default: "bg-black hover:bg-neutral-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    enabled: "bg-green-500 hover:bg-green-600 text-white",
    outline: "border border-gray-500 text-gray-700 hover:bg-gray-100",
    light: "bg-white text-black hover:bg-gray-100 shadow-md shadow-black/25",
  };

  // Pick the style for the chosen variant
  const variantClasses = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${variantClasses} px-6 py-2 mt-6 mb-6 rounded-full font-semibold shadow transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
}