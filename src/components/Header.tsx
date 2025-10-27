import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const location = useLocation();
  
  const navLinks = [
    { label: "Dashboard", path: "/" },
    { label: "Gaming", path: "/gaming" },
    { label: "Tech", path: "/tech" },
    { label: "Vijesti", path: "/vijesti" },
    { label: "Kalendar", path: "/kalendar" },
    { label: "Boards", path: "/boards" },
    { label: "Bookmarks", path: "/bookmarks" },
    { label: "Finansije", path: "/finance" },
    { label: "CRM", path: "/crm" },
    { label: "Fokus Timer", path: "/focus-timer" },
    { label: "Navike", path: "/habits-goals" },
    { label: "Mood", path: "/mood-tracker" },
    { label: "Admin Panel", path: "/admin" }
  ];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 animate-fade-in-down shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-lg font-bold tracking-tight transition-all duration-300 hover:text-primary cursor-pointer hover:scale-105">
            ADI ZELJKOVIĆ
          </Link>
          <nav className="flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary after:w-full'
                    : 'text-muted-foreground hover:text-primary after:w-0 hover:after:w-full'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
