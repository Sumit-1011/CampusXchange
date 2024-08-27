import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import config from "./config";

const SetAvatar = () => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchAvatars = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/api/avatars`);
      setAvatars(response.data);
    } catch (error) {
      console.error("Error fetching avatars", error);
      toast.error("Failed to fetch avatars. Please try again.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const handleSelectAvatar = async () => {
    if (loading) return; // Prevent action if already loading

    const userId = localStorage.getItem("userId"); // Assume userId is stored in localStorage during registration
    setLoading(true); // Set loading to true

    try {
      await axios.post("${config.apiBaseUrl}/api/setAvatar", {
        userId,
        avatar: selectedAvatar,
      });
      localStorage.removeItem("userId"); // Clean up
      toast.success("Avatar selected successfully, Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error setting avatar", error);
      toast.error("Failed to set avatar. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Select an Avatar</h2>
          <div className="flex flex-wrap justify-center mb-4 min-h-[96px]">
            {isLoading ? (
              <img src="loader.gif" alt="loader" className="loader w-24 h-24" />
            ) : (
              avatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className={`w-24 h-24 rounded-full cursor-pointer m-2 ${
                    selectedAvatar === avatar ? "border-4 border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                />
              ))
            )}
          </div>
          <button
            onClick={fetchAvatars}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Refresh
          </button>
          <button
            onClick={handleSelectAvatar}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!selectedAvatar || loading} // Disable button if loading or no avatar selected
          >
            {loading ? "Processing..." : "Select Avatar"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SetAvatar;
