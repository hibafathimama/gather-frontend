"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface UserType {
_id: string;
firstName: string;
lastName: string;
email: string;
role: string;
image?: string;
}

export default function AdminUsersPage() {
const [users, setUsers] = useState<UserType[]>([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState("");
const [error, setError] = useState("");
const [message, setMessage] = useState("");

const backendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_URL?.endsWith("/api")
    ? process.env.NEXT_PUBLIC_BACKEND_URL.slice(0, -4)
    : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";


const fetchUsers = async () => {
try {
setLoading(true);
setError("");

  const response = await api.get("/admin/users");
  setUsers(response.data.data || []);
} catch (err: unknown) {
  const errorMessage =
    typeof err === "object" &&
    err !== null &&
    "response" in err
      ? String(
          (err as { response?: { data?: { message?: string } } })
            .response?.data?.message || "Failed to fetch users"
        )
      : "Unable to connect to the server.";

  setError(errorMessage);
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchUsers();
}, []);

const filteredUsers = useMemo(() => {
const searchText = search.toLowerCase().trim();

return users.filter((user) => {
  const fullName = `${user.firstName || ""} ${
    user.lastName || ""
  }`.toLowerCase();

  return (
    fullName.includes(searchText) ||
    user.email.toLowerCase().includes(searchText) ||
    user.role.toLowerCase().includes(searchText)
  );
});

}, [users, search]);

const handleDelete = async (user: UserType) => {
const fullName = `${user.firstName} ${user.lastName}`.trim();

if (user.role === "admin") {
  return;
}

const confirmed = window.confirm(
  `Are you sure you want to delete ${fullName || user.email}?`
);

if (!confirmed) return;

try {
  setDeletingId(user._id);
  setError("");
  setMessage("");

  await api.delete(`/admin/users/${user._id}`);

  setUsers((previousUsers) =>
    previousUsers.filter((item) => item._id !== user._id)
  );

  setMessage("User deleted successfully.");
} catch (err: unknown) {
  const errorMessage =
    typeof err === "object" &&
    err !== null &&
    "response" in err
      ? String(
          (err as { response?: { data?: { message?: string } } })
            .response?.data?.message || "Failed to delete user"
        )
      : "Unable to connect to the server.";

  setError(errorMessage);
} finally {
  setDeletingId("");
}

};

return ( <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-8"> <div className="mx-auto max-w-7xl"> <div className="mb-8 flex flex-wrap items-center justify-between gap-4"> <div> <h1 className="text-3xl font-bold">Manage Users</h1> <p className="mt-2 text-gray-600">
View, search, and manage registered users and organizers. </p> </div>

      <Link
        href="/admin/dashboard"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
      >
        Back to Dashboard
      </Link>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Accounts</p>
        <p className="mt-2 text-3xl font-bold">{users.length}</p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Users</p>
        <p className="mt-2 text-3xl font-bold">
          {users.filter((user) => user.role === "user").length}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Organizers</p>
        <p className="mt-2 text-3xl font-bold">
          {users.filter((user) => user.role === "organizer").length}
        </p>
      </div>
    </div>

    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <label
          htmlFor="user-search"
          className="mb-2 block font-medium"
        >
          Search users
        </label>

        <input
          id="user-search"
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
          {message}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading users...
        </p>
      ) : filteredUsers.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          {search ? "No matching users found." : "No users found."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const fullName =
                  `${user.firstName || ""} ${
                    user.lastName || ""
                  }`.trim() || "Unnamed user";

                const imageSrc = user.image
                  ? user.image.startsWith("http")
                    ? user.image
                    : `${backendOrigin}${
                        user.image.startsWith("/")
                          ? user.image
                          : `/${user.image}`
                      }`
                  : "";

                return (
                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={fullName}
                            className="h-11 w-11 rounded-full border object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 font-semibold">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <span className="font-medium">{fullName}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={
                          user.role === "admin" ||
                          deletingId === user._id
                        }
                        title={
                          user.role === "admin"
                            ? "Admin accounts cannot be deleted"
                            : "Delete user"
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {deletingId === user._id
                          ? "Deleting..."
                          : user.role === "admin"
                            ? "Protected"
                            : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</main>

);
}
