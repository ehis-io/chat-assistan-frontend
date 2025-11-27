"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Register() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  function formatDOB(date: Date | null) {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background-color)]">
      <main className="w-full max-w-md bg-[var(--foreground-color)] shadow-lg p-6 rounded-xl">

        <h2 className="text-2xl font-semibold text-[var(--primary-color)] mb-6 text-center">
          Create an Account
        </h2>

        <form action="/api/register" method="POST" className="flex flex-col gap-4">

          <input
            type="text"
            name="firstName"
            placeholder="First name"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
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

          {/* Date of Birth */}
          <label className="text-sm font-medium text-[var(--text-muted)]">
            Date of Birth
          </label>

          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select your date of birth"
            className="w-full p-3 border text-[var(--text-color)] rounded-lg bg-[var(--foreground-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />

          {/* Hidden input to send formatted DOB */}
          <input type="hidden" name="dob" value={formatDOB(selectedDate)} />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="p-3 rounded-lg border text-[var(--text-color)] border-gray-300"
          />

          <button
            type="submit"
            className="p-3 rounded-lg bg-[var(--primary-color)] text-[var(--text-color)] font-medium hover:opacity-90 transition"
          >
            Register
          </button>
        </form>
      </main>
    </div>
  );
}
