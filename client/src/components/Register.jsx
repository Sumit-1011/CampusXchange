import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import config from "../config";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpButtonDisabled, setIsOtpButtonDisabled] = useState(false); // New state to disable OTP button

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return (
      usernameRegex.test(username) &&
      username.length < 16 &&
      username.length > 3
    );
  };

  const handleUsernameChange = (e) => {
    const lowerCaseUsername = e.target.value.toLowerCase();
    setUsername(lowerCaseUsername);

    if (!validateUsername(lowerCaseUsername)) {
      setUsernameError(
        "Username must be less than 16 characters and more than 3 characters long and contain only alphabets, numbers, and underscores."
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
            `${config.apiBaseUrl}/api/check-username`,
            { params: { username } }
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

    const debounce = setTimeout(checkUsernameAvailability, 500);
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

    setIsOtpButtonDisabled(true); // Disable the OTP sending button after click

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/api/otp/send-otp`,
        {
          username,
          email,
          password,
        }
      );

      if (response.data.status === "ok") {
        toast.success("OTP sent to your email");
        setIsOtpSent(true);
      } else {
        toast.error(response.data.error || "Failed to send OTP");
        setIsOtpButtonDisabled(false); // Re-enable the OTP button if sending fails
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast.error("Too many requests, please try again after 10 minutes");
      } else {
        toast.error("An error occurred while sending OTP");
      }
      setIsOtpButtonDisabled(false); // Re-enable the OTP button if sending fails
    }
  };

  const handleOtpVerification = async () => {
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/api/otp/verify-otp`,
        {
          email,
          otp,
          username,
          password,
        }
      );

      if (response.data.status === "ok") {
        toast.success("OTP Verified");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        navigate("/setavatar"); // Redirect after OTP is verified
      } else {
        setOtpError(response.data.message || "Invalid OTP");
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification");
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
              autoComplete="new-username"
            />
            {!usernameError && username && !isUsernameAvailable && (
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
              autoComplete="new-email"
              disabled={!isUsernameAvailable}
            />
          </div>

          <div className="mb-5 relative">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
              autoComplete="new-password"
              disabled={!isUsernameAvailable}
            />
            <button
              type="button"
              className="absolute right-0 p-1 text-gray-600 text-xl"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👀" : "🙈"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            disabled={!isUsernameAvailable || isOtpButtonDisabled} // Disable if username is not available or OTP is already sent
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

      {isOtpSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Enter OTP
            </h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent mb-4"
              required
            />
            {otpError && (
              <p className="text-red-500 text-sm mb-4 text-center">
                {otpError}
              </p>
            )}
            <button
              onClick={handleOtpVerification}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
