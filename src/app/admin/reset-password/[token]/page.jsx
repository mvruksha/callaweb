"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword({ params }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `https://callabackend.vercel.app/api/auth/reset-password/${params.token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) setTimeout(() => router.push("/admin/login"), 2000);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleReset} className="bg-white p-6 shadow rounded w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white p-2">
          Reset Password
        </button>
        {message && <p className="mt-3 text-blue-600">{message}</p>}
      </form>
    </div>
  );
}
