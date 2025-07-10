import { useEffect, useState } from "react";

function History() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
   const result = await window.electron.getUsers(search);

    setUsers(result);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div className="p-4">
      <h2>History</h2>
      <input
  type="text"
  placeholder="Search by name"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border p-1 m-2"
/>
      <button onClick={fetchUsers} className="bg-blue-500 text-white px-3 py-1 rounded">
        Search
      </button>

      <table className="mt-4 border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Contact</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Received</th>
            <th className="border px-2 py-1">Remaining</th>
            <th className="border px-2 py-1">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.id}</td>
              <td className="border px-2 py-1">{user.name}</td>
              <td className="border px-2 py-1">{user.contact}</td>
              <td className="border px-2 py-1">{user.total}</td>
              <td className="border px-2 py-1">{user.received}</td>
              <td className="border px-2 py-1">{user.remaining}</td>
              <td className="border px-2 py-1">{user.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
