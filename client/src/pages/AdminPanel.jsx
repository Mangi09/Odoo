import React, { useMemo, useState } from "react";

const dashboardStats = [
  {
    title: "Total Users",
    value: "18,420",
    change: "+14% this month",
  },
  {
    title: "Total Trips",
    value: "6,845",
    change: "+9% this week",
  },
  {
    title: "Popular Cities",
    value: "32",
    change: "5 trending this week",
  },
  {
    title: "Activities",
    value: "184",
    change: "+26 new activities",
  },
];

const users = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    trips: 12,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya@gmail.com",
    trips: 8,
    status: "Pending",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    email: "rahul@gmail.com",
    trips: 19,
    status: "Blocked",
  },
  {
    id: 4,
    name: "Ananya Kapoor",
    email: "ananya@gmail.com",
    trips: 5,
    status: "Active",
  },
];

const popularCities = [
  {
    id: 1,
    city: "Paris",
    visitors: 12400,
    growth: "+18%",
  },
  {
    id: 2,
    city: "Dubai",
    visitors: 10100,
    growth: "+14%",
  },
  {
    id: 3,
    city: "Tokyo",
    visitors: 8700,
    growth: "+10%",
  },
  {
    id: 4,
    city: "Bali",
    visitors: 7500,
    growth: "+22%",
  },
];

const popularActivities = [
  {
    id: 1,
    activity: "Mountain Hiking",
    bookings: 4200,
  },
  {
    id: 2,
    activity: "Beach Exploration",
    bookings: 3800,
  },
  {
    id: 3,
    activity: "City Food Tours",
    bookings: 3100,
  },
  {
    id: 4,
    activity: "Camping",
    bookings: 2700,
  },
];

const AdminPanel = () => {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("users");

  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [groupBy, setGroupBy] = useState("none");

  /* =========================
      USERS LOGIC
  ========================= */

  const processedUsers = useMemo(() => {
    let data = [...users];

    // SEARCH
    data = data.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // FILTER
    if (filter !== "All") {
      data = data.filter((user) => user.status === filter);
    }

    // SORT
    if (sortBy === "name") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "tripsHigh") {
      data.sort((a, b) => b.trips - a.trips);
    }

    if (sortBy === "tripsLow") {
      data.sort((a, b) => a.trips - b.trips);
    }

    return data;
  }, [search, filter, sortBy]);

  /* =========================
      GROUP USERS
  ========================= */

  const groupedUsers = useMemo(() => {
    if (groupBy === "status") {
      return {
        Active: processedUsers.filter((u) => u.status === "Active"),
        Pending: processedUsers.filter((u) => u.status === "Pending"),
        Blocked: processedUsers.filter((u) => u.status === "Blocked"),
      };
    }

    return {
      AllUsers: processedUsers,
    };
  }, [processedUsers, groupBy]);

  /* =========================
      CITIES LOGIC
  ========================= */

  const processedCities = useMemo(() => {
    let data = [...popularCities];

    // SEARCH
    data = data.filter((city) =>
      city.city.toLowerCase().includes(search.toLowerCase())
    );

    // SORT
    if (sortBy === "name") {
      data.sort((a, b) => a.city.localeCompare(b.city));
    }

    if (sortBy === "visitorsHigh") {
      data.sort((a, b) => b.visitors - a.visitors);
    }

    if (sortBy === "visitorsLow") {
      data.sort((a, b) => a.visitors - b.visitors);
    }

    return data;
  }, [search, sortBy]);

  /* =========================
      ACTIVITIES LOGIC
  ========================= */

  const processedActivities = useMemo(() => {
    let data = [...popularActivities];

    // SEARCH
    data = data.filter((activity) =>
      activity.activity.toLowerCase().includes(search.toLowerCase())
    );

    // SORT
    if (sortBy === "name") {
      data.sort((a, b) =>
        a.activity.localeCompare(b.activity)
      );
    }

    if (sortBy === "bookingsHigh") {
      data.sort((a, b) => b.bookings - a.bookings);
    }

    if (sortBy === "bookingsLow") {
      data.sort((a, b) => a.bookings - b.bookings);
    }

    return data;
  }, [search, sortBy]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage users, activities, analytics and destinations.
          </p>
        </div>

        <button className="bg-primary text-white px-5 py-3 rounded-2xl font-medium hover:bg-[#dd6a26] transition">
          + Add Activity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition"
          >
            <p className="text-gray-500">{item.title}</p>

            <h2 className="text-4xl font-bold text-gray-800 mt-3">
              {item.value}
            </h2>

            <p className="text-green-600 text-sm mt-3">{item.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Controls */}
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveSection("users")}
            className={`p-5 rounded-2xl font-medium transition-all ${
              activeSection === "users"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Manage Users
          </button>

          <button
            onClick={() => setActiveSection("cities")}
            className={`p-5 rounded-2xl font-medium transition-all ${
              activeSection === "cities"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Popular Cities
          </button>

          <button
            onClick={() => setActiveSection("activities")}
            className={`p-5 rounded-2xl font-medium transition-all ${
              activeSection === "activities"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Popular Activities
          </button>

          <button
            onClick={() => setActiveSection("analytics")}
            className={`p-5 rounded-2xl font-medium transition-all ${
              activeSection === "analytics"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            User Analytics
          </button>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex flex-col xl:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* FILTER */}
          {activeSection === "users" && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
            >
              <option value="All">All Users</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
          )}

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
          >
            <option value="default">Sort By</option>

            {activeSection === "users" && (
              <>
                <option value="name">Name A-Z</option>
                <option value="tripsHigh">Trips High-Low</option>
                <option value="tripsLow">Trips Low-High</option>
              </>
            )}

            {activeSection === "cities" && (
              <>
                <option value="name">City Name A-Z</option>
                <option value="visitorsHigh">
                  Visitors High-Low
                </option>
                <option value="visitorsLow">
                  Visitors Low-High
                </option>
              </>
            )}

            {activeSection === "activities" && (
              <>
                <option value="name">Activity Name A-Z</option>
                <option value="bookingsHigh">
                  Bookings High-Low
                </option>
                <option value="bookingsLow">
                  Bookings Low-High
                </option>
              </>
            )}
          </select>

          {/* GROUP */}
          {activeSection === "users" && (
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
            >
              <option value="none">No Grouping</option>
              <option value="status">Group By Status</option>
            </select>
          )}
        </div>
      </section>

      {/* USERS SECTION */}
      {activeSection === "users" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                User Management
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage users and monitor platform activity.
              </p>
            </div>
          </div>

          {Object.entries(groupedUsers).map(
            ([group, groupedData]) => (
              <div key={group} className="mb-10">
                {groupBy === "status" &&
                  groupedData.length > 0 && (
                    <h3 className="text-xl font-bold text-gray-700 mb-5">
                      {group}
                    </h3>
                  )}

                {groupedData.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 text-left">
                          <th className="pb-4 text-gray-500">
                            User
                          </th>

                          <th className="pb-4 text-gray-500">
                            Trips
                          </th>

                          <th className="pb-4 text-gray-500">
                            Status
                          </th>

                          <th className="pb-4 text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {groupedData.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-5">
                              <h3 className="font-semibold text-gray-800">
                                {user.name}
                              </h3>

                              <p className="text-sm text-gray-500">
                                {user.email}
                              </p>
                            </td>

                            <td className="py-5">
                              {user.trips} Trips
                            </td>

                            <td className="py-5">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : user.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>

                            <td className="py-5">
                              <div className="flex gap-2 flex-wrap">
                                <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm">
                                  View Trips
                                </button>

                                <button className="bg-gray-100 px-4 py-2 rounded-xl text-sm">
                                  Block
                                </button>

                                <button className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm">
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          )}
        </section>
      )}

      {/* CITIES SECTION */}
      {activeSection === "cities" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Popular Cities
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Trending destinations based on user activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {processedCities.map((city) => (
              <div
                key={city.id}
                className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {city.city}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {city.visitors.toLocaleString()} Visitors
                    </p>
                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {city.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ACTIVITIES SECTION */}
      {activeSection === "activities" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Popular Activities
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Most preferred activities by users.
            </p>
          </div>

          <div className="space-y-4">
            {processedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {activity.activity}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {activity.bookings.toLocaleString()} Bookings
                  </p>
                </div>

                <button className="bg-primary text-white px-4 py-2 rounded-xl">
                  View
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ANALYTICS SECTION */}
      {activeSection === "analytics" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                User Analytics
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Platform insights and growth metrics.
              </p>
            </div>

            <select className="border border-gray-200 rounded-xl px-4 py-2">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Graph */}
          <div className="h-80 flex items-end gap-4 mb-8">
            {[35, 55, 70, 45, 90, 65, 85].map(
              (height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary rounded-t-2xl"
                  style={{ height: `${height}%` }}
                ></div>
              )
            )}
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Peak Travel Season
              </h3>

              <p className="text-gray-500 text-sm">
                Summer and holidays show highest bookings.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                User Retention
              </h3>

              <p className="text-gray-500 text-sm">
                78% users returned for repeat trips.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                Revenue Growth
              </h3>

              <p className="text-gray-500 text-sm">
                Adventure packages generated highest revenue.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-2">
                AI Predictions
              </h3>

              <p className="text-gray-500 text-sm">
                Coastal destinations expected to trend next.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default AdminPanel;