import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-logo">Find-It</span>
        <span className="footer-copy">© 2024 Find-It. Handled with care.</span>
        <div className="footer-links">
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
        <div className="footer-social">
          <button className="icon-btn">🌐</button>
          <button className="icon-btn">↗</button>
        </div>
      </div>
    </footer>
  );
}
