export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Logout</button>
    </div>
  );
}
