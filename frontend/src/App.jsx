import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./state/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

function App() {
  const [user] = useAuth();
  console.log("App rendering, user:", user);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={user ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignupPage />}
        />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;

