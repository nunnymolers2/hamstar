import Logo from '../assets/images/logo.svg';
import UserIcon from '../assets/images/user.svg';

import '../assets/styles/Navbar.css';

function Navbar() {
  return (
    <nav className="bg-gray-100 p-4 flex items-center justify-between w-full">
      <a href="/" className="block">
        <img src={Logo} alt="Hamstar Logo" className="block h-8 w-8" />
      </a>
      <a href="/login" className="block">
        <img src={UserIcon} alt="User Icon" className="block h-8 w-8" />
      </a>
    </nav>
  );
}

export default Navbar;
