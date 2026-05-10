import React from "react";

const stats = [
  {
    title: "Total Users",
    value: "12,480",
    growth: "+12% this month",
  },
  {
    title: "Trips Booked",
    value: "3,245",
    growth: "+8% this week",
  },
  {
    title: "Popular Cities",
    value: "18",
    growth: "Top destination updated",
  },
  {
    title: "Activities",
    value: "126",
    growth: "+24 new activities",
  },
];

const quickActions = [
  "Manage Users",
  "Popular Cities",
  "Popular Activities",
  "User Trends & Analytics",
];

const recentUsers = [
  {
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    status: "Active",
  },
  {
    name: "Priya Verma",
    email: "priya@gmail.com",
    status: "Pending",
  },
  {
    name: "Rahul Mehta",
    email: "rahul@gmail.com",
    status: "Blocked",
  },
];

const AdminPanel = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage users, trips, analytics and platform activities.
          </p>
        </div>

        <button className="bg-[#F27932] hover:bg-[#df6c2c] transition-all text-white px-5 py-3 rounded-xl font-medium shadow-md">
          + Add New Activity
        </button>
      </div>

      {/* Top Controls */}
      <div className="bg-white rounded-3xl shadow-sm p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search users, cities, activities..."
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F27932]"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition">
              Group By
            </button>

            <button className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition">
              Filter
            </button>

            <button className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition">
              Sort By
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <p className="text-gray-500 text-sm">{item.title}</p>

            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {item.value}
            </h2>

            <p className="text-green-600 text-sm mt-3">{item.growth}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                Admin Controls
              </h2>

              <button className="text-sm text-[#F27932] font-medium">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-gray-100 hover:bg-[#F27932] hover:text-white transition-all rounded-2xl p-5 text-left font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                User Analytics
              </h2>

              <select className="border border-gray-200 rounded-xl px-4 py-2 outline-none">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Fake Graph UI */}
            <div className="h-72 flex items-end gap-4">
              {[40, 70, 55, 90, 65, 85, 60].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-[#F27932] rounded-t-2xl"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Users
            </h2>

            <button className="text-sm text-[#F27932] font-medium">
              See All
            </button>
          </div>

          <div className="space-y-4">
            {recentUsers.map((user, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : user.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;