"use client";

import { useState, useMemo } from "react";
import AuthGuard from "../component/AuthGuard";
import AdminStats from "../component/AdminStats";
import AccountTable, { Account } from "../component/AccountTable";

// Mock data for demonstration
const mockAccounts: Account[] = [
    {
        id: "USR001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phoneNumber: "+1 (555) 123-4567",
        status: "active",
        registrationDate: "2024-11-15T10:30:00Z",
        lastLogin: "2024-12-12T08:45:00Z",
        birthday: "1990-05-15"
    },
    {
        id: "USR002",
        firstName: "Sarah",
        lastName: "Smith",
        email: "sarah.smith@example.com",
        phoneNumber: "+1 (555) 234-5678",
        status: "active",
        registrationDate: "2024-11-20T14:20:00Z",
        lastLogin: "2024-12-11T16:30:00Z",
        birthday: "1988-08-22"
    },
    {
        id: "USR003",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.j@example.com",
        phoneNumber: "+1 (555) 345-6789",
        status: "inactive",
        registrationDate: "2024-10-05T09:15:00Z",
        lastLogin: "2024-11-28T12:00:00Z",
        birthday: "1992-03-10"
    },
    {
        id: "USR004",
        firstName: "Emily",
        lastName: "Brown",
        email: "emily.brown@example.com",
        phoneNumber: "+1 (555) 456-7890",
        status: "active",
        registrationDate: "2024-12-01T11:45:00Z",
        lastLogin: "2024-12-12T09:20:00Z",
        birthday: "1995-11-30"
    },
    {
        id: "USR005",
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@example.com",
        phoneNumber: "+1 (555) 567-8901",
        status: "suspended",
        registrationDate: "2024-09-12T13:30:00Z",
        lastLogin: "2024-10-15T10:00:00Z",
        birthday: "1987-07-18"
    },
    {
        id: "USR006",
        firstName: "Jessica",
        lastName: "Martinez",
        email: "jessica.m@example.com",
        phoneNumber: "+1 (555) 678-9012",
        status: "active",
        registrationDate: "2024-12-08T15:00:00Z",
        lastLogin: "2024-12-12T07:15:00Z",
        birthday: "1993-02-25"
    },
    {
        id: "USR007",
        firstName: "Robert",
        lastName: "Taylor",
        email: "robert.taylor@example.com",
        phoneNumber: "+1 (555) 789-0123",
        status: "active",
        registrationDate: "2024-11-28T10:10:00Z",
        lastLogin: "2024-12-10T14:45:00Z",
        birthday: "1991-09-05"
    },
    {
        id: "USR008",
        firstName: "Amanda",
        lastName: "Anderson",
        email: "amanda.a@example.com",
        phoneNumber: "+1 (555) 890-1234",
        status: "active",
        registrationDate: "2024-12-05T12:30:00Z",
        lastLogin: "2024-12-12T06:00:00Z",
        birthday: "1994-12-12"
    },
    {
        id: "USR009",
        firstName: "Christopher",
        lastName: "Thomas",
        email: "chris.thomas@example.com",
        phoneNumber: "+1 (555) 901-2345",
        status: "inactive",
        registrationDate: "2024-08-22T16:45:00Z",
        lastLogin: "2024-09-30T11:20:00Z",
        birthday: "1989-04-08"
    },
    {
        id: "USR010",
        firstName: "Lisa",
        lastName: "Garcia",
        email: "lisa.garcia@example.com",
        phoneNumber: "+1 (555) 012-3456",
        status: "active",
        registrationDate: "2024-12-10T09:00:00Z",
        lastLogin: "2024-12-12T10:30:00Z",
        birthday: "1996-06-20"
    }
];

export default function AdminPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | Account["status"]>("all");

    // Filter accounts based on search and status
    const filteredAccounts = useMemo(() => {
        return mockAccounts.filter(account => {
            const matchesSearch =
                account.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.phoneNumber.includes(searchQuery) ||
                account.id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" || account.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = mockAccounts.length;
        const active = mockAccounts.filter(a => a.status === "active").length;

        // Count accounts registered in the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newThisWeek = mockAccounts.filter(a => new Date(a.registrationDate) > weekAgo).length;

        return {
            totalAccounts: total,
            activeToday: active,
            newThisWeek: newThisWeek,
            growthRate: "+15.3%"
        };
    }, []);

    const handleViewDetails = (account: Account) => {
        console.log("View details:", account);
        // TODO: Implement view details modal or navigation
        alert(`Viewing details for ${account.firstName} ${account.lastName}`);
    };

    const handleEdit = (account: Account) => {
        console.log("Edit account:", account);
        // TODO: Implement edit functionality
        alert(`Edit functionality for ${account.firstName} ${account.lastName} - Coming soon!`);
    };

    const handleDelete = (account: Account) => {
        console.log("Delete account:", account);
        // TODO: Implement delete functionality with confirmation
        if (confirm(`Are you sure you want to delete ${account.firstName} ${account.lastName}?`)) {
            alert("Delete functionality - Coming soon!");
        }
    };

    return (
        <AuthGuard requireAdmin={true}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[var(--text-color)]">Admin Dashboard</h1>
                                    <p className="text-sm text-gray-500">Manage WhatsApp accounts and users</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Statistics */}
                    <AdminStats
                        totalAccounts={stats.totalAccounts}
                        activeToday={stats.activeToday}
                        newThisWeek={stats.newThisWeek}
                        growthRate={stats.growthRate}
                    />

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Status Filter */}
                            <div className="md:w-64">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <span className="text-sm font-semibold text-gray-700">
                                    {filteredAccounts.length} {filteredAccounts.length === 1 ? "result" : "results"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Accounts Table */}
                    <AccountTable
                        accounts={filteredAccounts}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </AuthGuard>
    );
}
