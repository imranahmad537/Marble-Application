import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    // <div className="flex">
    //   <Sidebar />
    //   <div className="w-full h-screen bg-gray-100">
    //     <Navbar />
    //     <div className="p-6">
    //       <Outlet />
    //     </div>
    //   </div>
    // </div>
    <div className="flex h-screen overflow-hidden">
  {/* Sidebar - Fixed and Non-Scrolling */}
  <div className="w-64 bg-white border-r border-gray-200">
    <Sidebar />
  </div>

  {/* Main Area */}
  <div className="flex flex-col flex-1 h-full">
    {/* Navbar - Fixed Height, Non-Scrolling */}
    <div className="h-16 bg-white border-b border-gray-200 shadow z-10">
      <Navbar />
    </div>

    {/* Scrollable Content Area */}
    <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-3">
      <Outlet />
    </div>
  </div>
</div>


  );
}
