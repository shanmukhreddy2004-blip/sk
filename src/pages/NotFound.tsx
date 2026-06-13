import { Link } from "react-router-dom";
import logo3d from "@/assets/logo3d.png";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <img src={logo3d} alt="Class2PPT" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
        <div className="font-display font-extrabold text-8xl gradient-text mb-4">404</div>
        <h1 className="font-display font-bold text-2xl text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">← Back to Home</Link>
      </div>
    </div>
  );
}
