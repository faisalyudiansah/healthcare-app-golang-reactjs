import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoNav from "@/assets/logo/newlogo.png";
import { Cookies } from "react-cookie";

const MenuNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const cookies = new Cookies();
    const token = cookies.get("access_token");

    const getLinkClassName = (path: string) => {
        return location.pathname === path
            ? "text-foreground"
            : "text-muted-foreground";
    };

    return (
        <nav className="hidden flex-col gap-6 text-lg font-medium lg:flex lg:flex-row lg:items-center md:text-sm lg:gap-6">
            <Link
                to="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base mr-10"
            >
                <div
                    onClick={() => navigate("/")}
                    className="flex ml-10 justify-center gap-2 md:gap-4 items-center"
                >
                    <img src={LogoNav} alt="Logo" className="w-3 md:w-7" />
                    <div className="font-comfortaa text[13px] md:text-[18px] font-extrabold text-primarypink tracking-wider">
                        Pathosafe
                    </div>
                </div>
            </Link>
            <Link
                to="/"
                className={`${getLinkClassName("/")} transition-colors hover:text-foreground `}
            >
                Home
            </Link>
            <Link
                to="/product"
                className={`${getLinkClassName("/product")} transition-colors hover:text-foreground `}
            >
                Products
            </Link>
            {token && (
                <Link
                    to="/order"
                    className={`${getLinkClassName("/order")} transition-colors hover:text-foreground `}
                >
                    Orders
                </Link>
            )}
            <Link
                to="/about"
                className={`${getLinkClassName("/about")} transition-colors hover:text-foreground `}
            >
                About
            </Link>
        </nav>
    );
};

export default MenuNavbar;
