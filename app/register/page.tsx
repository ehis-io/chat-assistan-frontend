"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import Navbar from "../component/Navbar";

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
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)] px-4 py-24">
        <main className="w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fadeInSlow">

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2">Create an Account</h2>
              <p className="text-[var(--text-muted)]">Join thousands of businesses automating their support.</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/onboarding";
            }}>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    required
                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    required
                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Date of Birth</label>
                <div className="w-full">
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    wrapperClassName="w-full"
                  />
                </div>
                <input type="hidden" name="dob" value={formatDOB(selectedDate)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--primary-color)] py-3.5 text-white font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Create Account
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[var(--primary-color)] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
