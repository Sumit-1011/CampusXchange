import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SetAvatar from "./components/SetAvatar";
import Profile from "./components/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import PublicRoute from "./components/PublicRoute";
import "react-toastify/dist/ReactToastify.css";
import AdminProducts from "./components/AdminProducts";
import ChatApp from "./Pages/ChatApp";

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<AuthenticatedRoute element={<Home />} />} />
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
          path="/chat/:chatId"
          element={<AuthenticatedRoute element={<ChatApp />} />}
        />
        {/* <Route
          path="/chat"
          element={<AuthenticatedRoute element={<Chat />} />}
        /> */}
        <Route
          path="/admin"
          element={<AuthenticatedRoute element={<AdminProducts />} />}
        />
        <Route path="*" element={<AuthenticatedRoute element={<Home />} />} />
      </Routes>
    </Router>
  );
}
