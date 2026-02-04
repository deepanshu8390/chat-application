import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../apiClient.js";
import { useAuth } from "../state/AuthContext.jsx";

function LoginPage() {
  const [, setUser] = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await apiClient.post("/api/auth/login", data);
      setUser(res.data.user);
      localStorage.setItem("mychatapp:user", JSON.stringify(res.data.user));
      toast.success("Logged in");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Login to continue chatting</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <label className="auth-label">
            Email
            <input
              type="email"
              {...register("email", { required: true })}
              className="auth-input"
            />
            {errors.email && <span className="auth-error">Required</span>}
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              {...register("password", { required: true })}
              className="auth-input"
            />
            {errors.password && <span className="auth-error">Required</span>}
          </label>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

