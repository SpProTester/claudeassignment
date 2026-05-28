import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar.jsx';
import Footer from '../common/Footer.jsx';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
