"use client";

import { useState } from "react";
import Form from "next/form";

export default function Register() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  function formatDOB() {
    if (!day || !month || !year) return "";
    const paddedDay = day.toString().padStart(2, "0");
    const paddedMonth = month.toString().padStart(2, "0");
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background-color)]">
      <main className="w-full max-w-md bg-[var(--foreground-color)] shadow-lg p-6 rounded-xl">

        <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-4 text-center">
          Create an Account
        </h2>

        <Form action="/api/register" className="flex flex-col gap-4">

          <input
            type="text"
            name="firstName"
            placeholder="First name"
            required
            className="p-3 rounded-lg border  text-[var(--text-color)] border-gray-300"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone number"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
          />

          {/* DOB */}
          <label className="text-sm font-medium text-[var(--text-muted)]">
            Date of Birth
          </label>

          <div className="flex gap-3">

            {/* Day */}
            <select
              name="day"
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="p-3 border text-[var(--text-color)] rounded-lg w-1/3"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              name="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="p-3 border text-[var(--text-color)] rounded-lg w-1/3"
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              name="year"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="p-3 border text-[var(--text-color)] rounded-lg w-1/3"
            >
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => 2025 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden input to send formatted DOB */}
          <input type="hidden" name="dob" value={formatDOB()} />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="p-3 rounded-lg border  text-[var(--text-color)] border-gray-300"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="p-3 rounded-lg border  text-[var(--text-color)] border-gray-300"
          />

          <button
            type="submit"
            className="p-3 rounded-lg bg-[var(--primary-color)] text-white font-medium hover:opacity-90 transition"
          >
            Register
          </button>
        </Form>
      </main>
    </div>
  );
}
