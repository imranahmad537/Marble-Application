// src/components/ui/card.jsx
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title }) {
  return <h2 className="text-lg font-semibold mb-2">{title}</h2>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
