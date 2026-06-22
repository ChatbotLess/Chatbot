import { useContext } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

const StaffRoute = ({ children }) => {
  const { loading, profile } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ifes-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

StaffRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StaffRoute;
