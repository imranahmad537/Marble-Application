import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="w-60 overflow-hidden h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Marble App</h2>
      <nav className="space-y-3">
        <Link to="/" className="flex items-center  p-2 text-white hover:bg-gray-700 rounded">
          <i className="fas fa-receipt mr-2"></i> Dashboard
        </Link>
         <Link to="/newdashboard" className="flex items-center  p-2 text-white hover:bg-gray-700 rounded">
          <i className="fas fa-receipt mr-2"></i> New Dashboard
        </Link>
        <Link to="/order" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
          <i className="fas fa-receipt mr-2"></i> Order
        </Link>
        <Link
          to="/inventory"
          className="flex items-center p-2 text-white hover:bg-gray-700 rounded"
        >
          <i className="fas fa-receipt mr-2"></i> New Order
        </Link>
         <Link to="/history" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
           <i className="fas fa-receipt mr-2"></i> History
         </Link>
      </nav>
    </div>
  )
}

// import { Link } from 'react-router-dom'

// export default function Sidebar() {
//   return (
//     <div className="w-64 h-screen bg-gray-800 text-white p-5 fixed top-0 left-0">
//       <h2 className="text-2xl font-bold mb-6">Marble Co</h2>
//       <nav className="flex flex-col space-y-4">

//         <Link to="/" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
//           <i className="fas fa-receipt mr-2"></i> Dashboard
//         </Link>
//          <Link to="/order" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
//           <i className="fas fa-receipt mr-2"></i> Order
//         </Link>
//          <Link to="/inventory" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
//           <i className="fas fa-receipt mr-2"></i> Inventory
//         </Link>
//          {/* <Link to="/menu1" className="flex items-center p-2 text-white hover:bg-gray-700 rounded">
//           <i className="fas fa-receipt mr-2"></i> Menu1
//         </Link> */}
//       </nav>
//     </div>
//   )
// }
