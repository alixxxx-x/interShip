import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = () => {
  const location = useLocation();
  const hideFooterRoutes = ["/internships", "/settings"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <Navbar>
      <main className="flex-1">
        <Outlet />
      </main>
      {!shouldHideFooter && <Footer />}
    </Navbar>
  );
};

export default MainLayout;
