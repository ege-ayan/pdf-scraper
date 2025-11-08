"use client";

import { useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";

export default function AuthForm() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError("Invalid email or password.");
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: email }),
        });
        if (res.ok) {
          await signIn("credentials", { redirect: false, email, password });
        } else {
          setError("Registration failed. User may already exist.");
        }
      } catch (err) {
        setError("An error occurred during registration.");
      }
    }
  };

  if (status === "loading") return <p>Loading session...</p>;

  if (session) {
    return (
      <div style={{ textAlign: "center" }}>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Sign In" : "Register"}</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          {isLogin ? "Sign In" : "Register"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{
          marginTop: "10px",
          background: "none",
          border: "none",
          color: "blue",
          cursor: "pointer",
        }}
      >
        {isLogin ? "Need an account? Register" : "Have an account? Sign In"}
      </button>
    </div>
  );
}
