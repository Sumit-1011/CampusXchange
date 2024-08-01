import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SetAvatar from "./components/SetAvatar";
import Profile from "./components/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import ChatInterface from "./components/ChatInterface";

// Replace this with actual current user retrieval logic
const currentUser = {
  _id: "currentUserId", // Replace with the actual current user ID
  username: "currentUsername",
  email: "currentEmail",
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/chat"
          element={
            <AuthenticatedRoute
              element={<ChatInterface currentUser={currentUser} />}
            />
          }
        />
        <Route path="/" element={<AuthenticatedRoute element={<Home />} />} />
      </Routes>
    </Router>
  );
}
