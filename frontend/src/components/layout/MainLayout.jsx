import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <Navbar>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </Navbar>
  );
};

export default MainLayout;
