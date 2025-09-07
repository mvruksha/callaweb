"use client";

import ProtectedRoute from "@/components/adminpage/adminLogin/ProtectedRoute";
import UsersTable from "@/components/adminpage/adminLogin/usertable/UserTable";
import { useState } from "react";

export default function AddUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // 🔑 Get token from localStorage (must be set at login)
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ No token found. Please login first.");
        return;
      }

      const res = await fetch(
        "https://callabackend.vercel.app/api/auth/register-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send token
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ User created successfully");
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setMessage(`❌ ${data.message || "Failed to add user"}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleAddUser}
          className="bg-white shadow-lg rounded p-6 w-96"
        >
          <h2 className="text-2xl font-bold mb-4">Add User</h2>

          <input
            type="text"
            placeholder="Username"
            className="w-full border p-2 mb-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-800 text-white p-2 rounded"
          >
            Create User
          </button>

          {message && <p className="mt-3 text-center">{message}</p>}
        </form>
      </div>
      <UsersTable />
    </ProtectedRoute>
  );
}
