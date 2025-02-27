
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
    <a href="/">
    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
      <img src="PIBBY_bee.png" className="scale-200 filter invert-[0.9]"></img>
    </div>
    </a>
  </div>
  <div className="navbar-center">
    <a className="btn btn-ghost text-xl">Project in a Box: Socket Surge</a>
  </div>

  <div className="navbar-end">
    <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <li><a href="/project-statement">About Project</a></li>
          <li><a href="/project-team">About Team</a></li>
          <li><a href="https://github.com/yyunshanli/Socket-Surge-Chess">Github Repo</a></li>
        </ul>
      </div>
  </div>
</div>
    <Outlet/>
    </div>
  );
};

export default Navbar;
