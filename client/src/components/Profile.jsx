import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatarImage: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "ok") {
          setUser(response.data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        {user.avatarImage && (
          <img
            src={user.avatarImage}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
        )}
        <p className="text-xl mb-2">Username: {user.username}</p>
        <p className="text-xl mb-2">Email: {user.email}</p>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
