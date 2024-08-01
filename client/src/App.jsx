import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import SetAvatar from "./components/SetAvatar";
import Profile from "./components/Profile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import NotFound from "./components/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route
          path="/profile"
          element={<AuthenticatedRoute element={<Profile />} />}
        />
        <Route path="/" element={<AuthenticatedRoute element={<Home />} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
