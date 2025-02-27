
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
      <div className="navbar bg-base-300">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avar">
        <img src="PIBBY_bee.png" className="filter invert-[0.9]"></img>
      </div>
    </div>
  </div>
  <div className="navbar-center">
    <a className="btn btn-ghost text-xl">Project in a Box: Socket Surge</a>
  </div>

  <div className="navbar-end">
  </div>
</div>
    <Outlet/>
    </div>
  );
};

export default Navbar;
