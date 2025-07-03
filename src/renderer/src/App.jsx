import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Order from "./Pages/Order";
import Sales from "./pages/Sales";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="order" element={<Order />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

    // <Router
    // >
    //   <div className="flex">
    //     <Sidebar />
    //     {/* Content shifts to right of sidebar */}
    //     <div className="ml-50 w-full min-h-screen bg-gray-100">
    //       <Navbar />
    //       <div className="p-6">
    //         <Routes>
    //           <Route path="/" element={<Dashboard />} />
    //           <Route path="/order" element={<Order />} />
    //           <Route path="/inventory" element={<Inventory />} />
    //           <Route path="/sales" element={<Sales />} />
    //         </Routes>
    //       </div>
    //     </div>
    //   </div>
    // </Router>
