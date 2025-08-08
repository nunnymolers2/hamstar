import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  return (
    
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-80 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.displayName}!</h1>
        <p className="mb-4">Email: {user?.email}</p>
        <Link to="/create-listing">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 mb-2 px-4 rounded-lg w-full">List something?</button>
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}