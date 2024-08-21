import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SetAvatar from "./components/SetAvatar";
import Profile from "./components/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import PublicRoute from "./components/PublicRoute"; // Ensure this is imported
import "react-toastify/dist/ReactToastify.css";
import AdminProducts from "./components/AdminProducts";

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="*" element={<PublicRoute element={<Login />} />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route
          path="/register"
          element={<PublicRoute element={<Register />} />}
        />
        <Route
          path="/setavatar"
          element={<AuthenticatedRoute element={<SetAvatar />} />}
        />
        <Route
          path="/profile"
          element={<AuthenticatedRoute element={<Profile />} />}
        />
        <Route
          path="/admin"
          element={<AuthenticatedRoute element={<AdminProducts />} />}
        />
        <Route path="/" element={<AuthenticatedRoute element={<Home />} />} />
        <Route path="*" element={<AuthenticatedRoute element={<Home />} />} />
      </Routes>
    </Router>
  );
}
