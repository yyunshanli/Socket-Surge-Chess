
import { Outlet } from "react-router-dom";
import { useState } from "react";

interface NavbarItem {
    name: string,
    id: number
}

interface NavbarProps {
    navItems: NavbarItem[];
}

const Navbar = ({ navItems }: NavbarProps) => {
  const [active, setActive] = useState(false);

  const handleNav = (): void => {
    setActive(!active)
  }

  

  return (
    <div>
        <div className="relative size-32 ...">
        <div className="absolute inset-x-0 top-0 h-16 ...">02
            
        </div>
        </div>
    <Outlet/>
    </div>
  );
};

export default Navbar;
