import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Sales from "./pages/Sales";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        {/* Content shifts to right of sidebar */}
        <div className="ml-64 w-full min-h-screen bg-gray-100">
          <Navbar />
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<Sales />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
