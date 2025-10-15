const Header = () => {
  const navLinks = [
    "DASHBOARDI",
    "GAMING",
    "TECH I VIJESTI",
    "KALENDAR",
    "BOARDSI",
    "ADMIN PANEL"
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tight">ADI ZELJKOVIĆ</h1>
          <nav className="flex gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
