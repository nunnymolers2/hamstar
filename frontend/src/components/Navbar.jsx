import { useState, useRef, useEffect } from "react";

import Logo from "../assets/images/logo.svg";
{
  /* HamSTAR logo */
}
import Search from "../assets/images/search.svg";
{
  /* Search icon */
}
import NewPost from "../assets/images/new-post.svg";
{
  /* New Post icon */
}
import Messaging from "../assets/images/message-icon.svg";
{
  /* Messaging icon */ 
}
import Notifs from "../assets/images/notif-bell.svg";
{
  /* Notifications icon */
}
{
  /* import NotifsBadge from '../assets/images/notif-badge.svg';  Notifications icon with badge.*/
}
{
  /* FIX: Add a Notification bell SVG that has a badge edited on it. */
}
import UserIcon from "../assets/images/user.svg";
{
  /* User Profile icon */
}

import "../assets/styles/Navbar.css";

function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []); 

    // Placeholder notifications
  const notifications = [
    "Your listing has been approved.",
    "You received a new message.",
    "Your claim was accepted.",
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 p-4 flex items-center justify-between w-full">
      {/* HamSTAR logo */}
      <a href="/" className="block">
        <img src={Logo} alt="Hamstar Logo" className="block h-8 w-8" />
      </a>

      {/* Search Bar */}
      <div className="flex-1 mx-6 relative">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <img
          src={Search}
          alt="Search Icon"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
        />
      </div>

      {/* New Post */}
      <a href="/create-listing" className="block">
        <img src={NewPost} alt="New Post Icon" className="block h-8 w-8" />
      </a>

      {/* Messaging */}
      <a href="/messaging" className="block">
        <img src={Messaging} alt="Messaging" className="block h-8 w-8" />
      </a>

      {/* Notifs / Updates */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((prev) => !prev)}
          className="block focus:outline-none"
          aria-label="Toggle notifications dropdown"
        >
          <img src={Notifs} alt="Notifications Icon" className="h-8 w-8" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
            <div className="p-4 border-b font-semibold">Notifications</div>
            <ul className="max-h-48 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="p-4 text-center text-gray-500">No notifications</li>
              ) : (
                notifications.map((note, i) => (
                  <li key={i} className="p-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer">
                    {note}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      {/* FIX: This needs to change from Notifs to NotifsBadge when the user has a notif. */}

      {/* User Profile */}
      <a href="/login" className="block">
        <img src={UserIcon} alt="User Icon" className="block h-8 w-8" />
      </a>
    </nav>
  );
}

export default Navbar;
