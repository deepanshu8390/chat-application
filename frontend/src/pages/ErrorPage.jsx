import React from "react";
import { useSearchParams } from "react-router-dom";

function ErrorPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "Unknown";
  const message = searchParams.get("message") || "An error occurred";

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Error {code}</h1>
        <p className="auth-subtitle">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="auth-button"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;