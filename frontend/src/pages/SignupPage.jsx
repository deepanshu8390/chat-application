import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiClient } from "../apiClient.js";
import { useAuth } from "../state/AuthContext.jsx";

function SignupPage() {
  const [, setUser] = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      const body = {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      await apiClient.post("/api/auth/signup", body);
      toast.success("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.error || "Signup failed";
      toast.error(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">It only takes a few seconds</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <label className="auth-label">
            Name
            <input
              type="text"
              {...register("name", { required: true })}
              className="auth-input"
            />
            {errors.name && <span className="auth-error">Required</span>}
          </label>

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
            Mobile
            <input
              type="text"
              {...register("mobile", { required: true })}
              className="auth-input"
            />
            {errors.mobile && <span className="auth-error">Required</span>}
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="auth-input"
            />
            {errors.password && (
              <span className="auth-error">Min 6 characters</span>
            )}
          </label>

          <label className="auth-label">
            Confirm password
            <input
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="auth-input"
            />
            {errors.confirmPassword && (
              <span className="auth-error">
                {errors.confirmPassword.message || "Required"}
              </span>
            )}
          </label>

          <button type="submit" className="auth-button">
            Sign up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;

