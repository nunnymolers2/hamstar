import Logo from '../assets/images/logo.svg';
import UserIcon from '../assets/images/user.svg';
import { FiSearch } from 'react-icons/fi';
import { FaRegPenToSquare } from "react-icons/fa6";


import '../assets/styles/Navbar.css';

function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 flex items-center justify-between w-full">
      <a href="/" className="block">
        <img src={Logo} alt="Hamstar Logo" className="block h-8 w-8" />
      </a>
      <div className="flex-1 mx-6 relative">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      </div>
      <FaRegPenToSquare className="block h-8 w-8"/>
      <a href="/login" className="block">
        <img src={UserIcon} alt="User Icon" className="block h-7 w-7"/>
      </a>
    </nav>
  );
}

export default Navbar;
