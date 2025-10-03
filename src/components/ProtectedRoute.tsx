import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ComingSoon from "@/pages/ComingSoon";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has access
    const access = sessionStorage.getItem("metrobotz-access");
    setHasAccess(access === "granted");
  }, []);

  // Show loading while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-secondary">Checking access...</p>
        </div>
      </div>
    );
  }

  // If no access, show coming soon page
  if (!hasAccess) {
    return <ComingSoon />;
  }

  // If has access, show protected content
  return <>{children}</>;
};

export default ProtectedRoute;
