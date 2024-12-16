import { useCookies } from "react-cookie";
import MenuNavbarResponsive from "./MenuNavbarResponsive";
import MenuNavbar from "./MenuNavbar";
import DropdownUser from "./DropdownUser";
import DropdownToggleTheme from "./DropdownToggleTheme";
import ModalLogin from "../modal/auth/ModalLogin";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [cookies] = useCookies(["access_token"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (cookies.access_token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [cookies.access_token]);

  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MenuNavbar />
        <MenuNavbarResponsive />
        <div className="flex w-full items-center justify-end lg:mr-8 gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownToggleTheme />
          {!isLoggedIn && <ModalLogin titleButton="Sign in" />}
          {isLoggedIn && <DropdownUser />}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
