import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main class='flex-1'>
        <Outlet />  {/* This is where the child routes will be rendered */}
      </main>
    </>
  );
}