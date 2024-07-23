import React from "react";
import Register from "./components/Register";
import Username from "./components/Username";
import Password from "./components/Password";
import Recovery from "./components/Recovery";
import Reset from "./components/Reset";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/password" element={<Password />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/" element={<Username />} />
        {/* <Route
          path="/"
          element={<AuthenticatedRoute element={<TodoList />} />}
        /> */}
      </Routes>
    </Router>
  );
}
