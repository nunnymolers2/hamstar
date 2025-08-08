import Logo from '../assets/images/logo.svg';               {/* HamSTAR logo */}
import Search from '../assets/images/search.svg';           {/* Search icon */}
import NewPost from '../assets/images/new-post.svg';        {/* New Post icon */}
import Notifs from '../assets/images/notif-bell.svg';       {/* Notifications icon */}
{/* import NotifsBadge from '../assets/images/notif-badge.svg';  Notifications icon with badge.*/}
{/* FIX: Add a Notification bell SVG that has a badge edited on it. */}
import UserIcon from '../assets/images/user.svg';           {/* User Profile icon */}


import '../assets/styles/Navbar.css';

function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 flex items-center justify-between w-full">

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
      <a href="#" className="block">
        <img src={NewPost} alt="New Post Icon" className="block h-8 w-8"/>
      </a>

      {/* Notifs / Updates */}
      <a href="#" className="block">
        <img src={Notifs} alt="Notifications Icon" className="block h-8 w-8"/>
      </a>
      {/* FIX: This needs to change from Notifs to NotifsBadge when the user has a notif. */}

      {/* User Profile */}
      <a href="/login" className="block">
        <img src={UserIcon} alt="User Icon" className="block h-8 w-8"/>
      </a>

    </nav>
  );
}

export default Navbar;
