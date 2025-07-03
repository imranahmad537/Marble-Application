import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5 fixed top-0 left-0">
      <h2 className="text-2xl font-bold mb-6">Marble Co</h2>
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="hover:text-gray-300">Dashboard</Link>
        <Link to="/inventory" className="hover:text-gray-300">Inventory</Link>
        <Link to="/sales" className="hover:text-gray-300">Sales</Link>
      </nav>
    </div>
  );
}
