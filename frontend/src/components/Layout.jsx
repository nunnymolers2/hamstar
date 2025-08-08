import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className='flex-1'>
        <Outlet />  {/* This is where the child routes will be rendered */}
      </main>
    </>
  );
}