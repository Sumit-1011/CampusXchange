import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure this is imported globally
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if token already exists in local storage
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  // Validate username with regex and length
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username) && username.length < 15;
  };

  // Convert username to lowercase on every change
  const handleUsernameChange = (e) => {
    const lowerCaseUsername = e.target.value.toLowerCase();
    setUsername(lowerCaseUsername);

    if (!validateUsername(lowerCaseUsername)) {
      setUsernameError(
        "Username must be less than 16 characters long and contain only alphabets, numbers, and underscores."
      );
      setIsUsernameAvailable(false);
      setIsUsernameValid(false);
    } else {
      setUsernameError("");
      setIsUsernameValid(true);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,15}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (username && isUsernameValid) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/check-username",
            {
              params: { username },
            }
          );

          if (response.data.status === "ok") {
            setIsUsernameAvailable(true);
            setUsernameError("");
          } else {
            setIsUsernameAvailable(false);
            setUsernameError(
              response.data.message || "Username is already taken"
            );
          }
        } catch (error) {
          setIsUsernameAvailable(false);
          setUsernameError("Error checking username availability");
        }
      } else {
        setIsUsernameAvailable(false);
      }
    };

    const debounce = setTimeout(checkUsernameAvailability, 500); // Debounce to reduce number of requests

    return () => clearTimeout(debounce);
  }, [username, isUsernameValid]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error(
        "Password must be 6-15 characters, contain special characters, and include at least one lowercase and one uppercase character."
      );
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });

      if (response.data.status === "ok") {
        toast.success("Registration Successful");
        const userId = response.data.userId;
        if (userId) {
          localStorage.setItem("userId", userId);
          navigate("/setAvatar");
        } else {
          navigate("/login");
        }
      } else {
        toast.error(response.data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Register
        </h2>
        <form onSubmit={handleRegister}>
          <div className="mb-5 relative">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                !isUsernameAvailable && "border-red-500"
              }`}
              required
            />
            {username && !isUsernameAvailable && (
              <span className="absolute top-9 right-1 flex items-center text-red-500">
                ❌
              </span>
            )}
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          <div className="mb-5">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              disabled={!isUsernameAvailable}
            />
          </div>
          <div className="mb-5">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              disabled={!isUsernameAvailable}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            disabled={!isUsernameAvailable}
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
