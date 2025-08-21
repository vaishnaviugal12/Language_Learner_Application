import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, checkAuth } from "../authSlice";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Check auth state on page load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4">
      <h1 className="text-2xl font-bold">Home Page</h1>

      {!isAuthenticated && (
        <>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Signup
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Login
          </button>
        </>
      )}

      {isAuthenticated && (
        <>
          <p className="text-lg">Welcome, {user?.username || user?.email}</p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </>
      )}

      <button
        onClick={() => navigate("/match")}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Start Learning
      </button>
    </div>
  );
}

