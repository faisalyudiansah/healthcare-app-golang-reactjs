import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import LogoNav from "@/assets/logo/newlogo.png";
import { Cookies } from "react-cookie";

const MenuNavbarResponsive = () => {
    const navigate = useNavigate()
    const cookies = new Cookies();
    const token = cookies.get("access_token");

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        to="#"
                        className="flex items-center gap-2 text-lg font-semibold"
                    >
                        <div onClick={() => navigate('/')} className='flex justify-center gap-2 items-center'>
                            <img src={LogoNav} alt="Logo" className='w-10' />
                            <div className="font-comfortaa text-[28px] font-extrabold text-primarypink tracking-wider">
                                Pathosafe
                            </div>
                        </div>
                    </Link>
                    <Link to="/" className="hover:text-foreground">
                        Home
                    </Link>
                    {token && (
                        <Link
                            to="/order"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Orders
                        </Link>
                    )}
                    <Link
                        to="/product"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Products
                    </Link>
                    <Link
                        to="/about"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        About
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}

export default MenuNavbarResponsive