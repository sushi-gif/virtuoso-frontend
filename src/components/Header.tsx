import { useAuth } from "../auth/auth";
import { AiOutlineHome, AiOutlineCluster} from "react-icons/ai";
import { GiArtificialHive } from "react-icons/gi";
import { GoServer } from "react-icons/go";
import { RiGroupLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";

import logo from "../img/logo.svg";
import "../style/login.css";
import { Link, NavLink, useParams, Outlet, useOutletContext } from "react-router-dom";

export function Header() {

  const auth = useAuth();

  return (
    <header className="header">
      <div className="header-content responsive-wrapper shadow-line">
        <div className="header-navigation">
            <a href="#" className="title-navbar">
              <img src={logo} className="logo-xs"/>
            </a>
            <div className="header-navigation-actions">
            <a href="/settings" className="icon-button">
              <i className="ph-gear-bold"></i>
            </a>
            <a href="#" className="icon-button">
              <i className="ph-bell-bold"></i>
            </a>
            <a href="/profile" className="button leftmr">
              <FaRegUser size={16}/>
              <span>{auth?.userData?.username}</span>
            </a>
            <a href="#" className="button leftmr Stopped" onClick={() => auth?.signOut()}>
              <MdOutlineLogout size={20}/>
            </a>
          </div>
          </div>
          
      </div>
        <div className="header-content responsive-wrapper shadow-line">
          <div className="header-navigation">
            <nav className="header-navigation-links">
              <NavLink to={`/`} className={({ isActive }) => (isActive ? 'active-nav' : '')}><AiOutlineHome size={22}/> <span>Home</span></NavLink>
              <NavLink to={`/mcp`} className={({ isActive }) => (isActive ? 'active-nav' : '')}><GiArtificialHive size={22}/> <span>Claude</span></NavLink>
              <NavLink to={`/templates`} className={({ isActive }) => (isActive ? 'active-nav' : '')}><AiOutlineCluster size={22}/> <span>Templates</span></NavLink>
              <NavLink to={`/vm`} className={({ isActive }) => (isActive ? 'active-nav' : '')}><GoServer size={22}/> <span>Virtual Machine</span></NavLink>
              <NavLink to={`/users`} className={({ isActive }) => (isActive ? 'active-nav' : '')}><RiGroupLine size={20}/> <span>Users</span></NavLink>
            </nav>
            <div className="search-nav">
              <IoSearchOutline size={22}/>
              <input className="strip-input" type="text" value="" placeholder="Search…" aria-label="Search in website" />
            </div>          
            </div>
        </div>
      </header>
  );

}
