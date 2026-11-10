
import { NavLink } from "react-router-dom";
import {
  House,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  ClipboardList,
  UserRound
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    { name: "Home", path: "/", icon: House },
    { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
    { name: "Students", path: "/students", icon: GraduationCap },
    { name: "How We Work", path: "/how-we-work", icon: Users },
    { name: "How We Hire", path: "/how-we-hire", icon: ClipboardList },
    { name: "Your Career", path: "/your-career", icon: UserRound }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
