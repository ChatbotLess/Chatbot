import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { loading, user, profile, profileError, logOut } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ifes-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (user && profile) {
    return children;
  }

  if (user && profileError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-gray-950">
        <p>{profileError}</p>
        <button
          type="button"
          className="rounded-md bg-ifes-green-600 px-4 py-2 font-medium hover:bg-ifes-green-500"
          onClick={logOut}
        >
          Voltar ao login
        </button>
      </div>
    );
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
