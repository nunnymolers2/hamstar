//The commented out code may or may not be unnecessary.
//Perhaps remove them in further iterations.

//import { useContext } from "react";
//import { AuthContext } from "../context/AuthProvider";
//import { signOut } from "firebase/auth";
import { auth } from "../firebase";
//import { Link } from 'react-router-dom';

import { useState } from "react";

import Profile from "../components/Profile.jsx";
import ClaimsBuying from "../components/ClaimsBuying.jsx";
import ClaimsSelling from "../components/ClaimsSelling.jsx";


export default function Dashboard() {
  //const { user } = useContext(AuthContext);

  //const handleLogout = async () => {
  //  await signOut(auth);
  //};

  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "buying":
        return <ClaimsBuying />;
      case "selling":
        return <ClaimsSelling />;
      default:
        return <Profile />;
    };
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-48 bg-white shadow-md flex flex-col p-4 space-y-2">
        <button
          className={`py-2 px-4 rounded ${
            activeTab === "profile" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={`py-2 px-4 rounded ${
            activeTab === "buying" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("buying")}
        >
          My Claims
        </button>

        <button
          className={`py-2 px-4 rounded ${
            activeTab === "selling" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("selling")}
        >
          My Listings
        </button>

      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}