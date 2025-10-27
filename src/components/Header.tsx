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
    <header className="glass-card border-b border-border/50 sticky top-0 z-50 animate-fade-in-down">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xl font-display font-bold tracking-tight transition-all duration-300 hover:text-primary cursor-pointer hover:scale-105 gradient-text"
          >
            ADI ZELJKOVIĆ
          </Link>
          <nav className="flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative group ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className={`absolute inset-0 bg-primary/10 rounded-lg transform transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'scale-100 opacity-100' 
                    : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`} />
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
