import Link from "next/link";

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Settings", href: "/settings" },
    currentUser && { label: "Sell Tickets", href: "/tickets/new" },
    currentUser && { label: "My Orders", href: "/orders" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <li key={href} className="nav-item">
          <Link href={href}>
            <a
              className={
                "ms-2 " +
                (label == "Sign Up"
                  ? "btn btn-dark text-white"
                  : label == "Sign In"
                  ? "btn btn-outline-dark"
                  : "nav-link")
              }
            >
              {label}
            </a>
          </Link>
        </li>
      );
    });

  return (
    <div className="container-fluid">
      <div className="demo-section">
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
          <div className="container">
            <a className="navbar-brand logo" href="/">
              <i className="fa-solid fa-ticket" style={{ color: "#74C0FC" }} />
              &nbsp; <span className="navbar-brand">Ticketing</span>
            </a>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav1"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav1">
              <ul className="navbar-nav ms-auto">{links}</ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
export default Header;
