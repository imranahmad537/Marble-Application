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
  <Sidebar />
  <div className="flex flex-col w-full h-full bg-gray-100">
    <Navbar />
    <div className="flex-1 px-2">
      <Outlet />
    </div>
  </div>
</div>

  );
}
