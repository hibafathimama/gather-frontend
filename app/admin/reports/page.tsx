"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface ReportType {
_id: string;
reason: string;
description: string;
status: "pending" | "reviewed" | "resolved" | "dismissed";
adminNote: string;
createdAt: string;
reportedBy?: {
firstName: string;
lastName: string;
email: string;
} | null;
event?: {
_id: string;
eventName: string;
date?: string;
time?: string;
venue?: string;
location?: string;
} | null;
}

const reportStatuses = ["pending", "reviewed", "resolved", "dismissed"] as const;

export default function AdminReportsPage() {
const [reports, setReports] = useState<ReportType[]>([]);
const [filterStatus, setFilterStatus] = useState("all");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [savingId, setSavingId] = useState<string | null>(null);
const [message, setMessage] = useState("");

const [deletingId, setDeletingId] = useState<string | null>(null);

const handleDeleteReportedEvent = async (report: ReportType) => {
if (!report.event?._id) {
setError("Event information is unavailable. Cannot delete this event.");
return;
}

const confirmed = window.confirm(
`Are you sure you want to delete "${report.event.eventName}"? This action cannot be undone.`
);

if (!confirmed) return;

try {
setDeletingId(report._id);
setError("");
setMessage("");

// Delete the reported event using the existing admin API.
await api.delete(`/admin/events/${report.event._id}`, {
  withCredentials: true,
});

// Mark the report as resolved after successful deletion.
const response = await api.patch(
  `/admin/reports/${report._id}`,
  {
    status: "resolved",
    adminNote: "Event deleted by admin after reviewing the report.",
  },
  { withCredentials: true }
);

const updatedReport = response.data.data;

setReports((previous) =>
  filterStatus !== "all" && filterStatus !== "resolved"
    ? previous.filter((item) => item._id !== report._id)
    : previous.map((item) =>
        item._id === report._id ? updatedReport : item
      )
);

setMessage("Event deleted successfully and report marked as resolved.");

} catch (err: unknown) {
if (err && typeof err === "object" && "response" in err) {
const apiError = err as {
response?: { data?: { message?: string } };
};

  setError(
    apiError.response?.data?.message ||
      "Failed to delete the event or update the report."
  );
} else {
  setError("Unable to connect to the backend.");
}

} finally {
setDeletingId(null);
}
};


const fetchReports = async (status: string) => {
try {
setLoading(true);
setError("");

  const response = await api.get(
    status === "all"
      ? "/admin/reports"
      : `/admin/reports?status=${status}`,
    { withCredentials: true }
  );

  setReports(response.data.data || []);
} catch (err: unknown) {
  if (err && typeof err === "object" && "response" in err) {
    const apiError = err as {
      response?: { data?: { message?: string } };
    };

    setError(
      apiError.response?.data?.message || "Failed to load reports."
    );
  } else {
    setError("Unable to connect to the backend.");
  }
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchReports(filterStatus);
}, [filterStatus]);

const handleUpdateReport = async (
reportId: string,
status: ReportType["status"],
adminNote: string
) => {
try {
setSavingId(reportId);
setError("");
setMessage("");

  const response = await api.patch(
    `/admin/reports/${reportId}`,
    { status, adminNote },
    { withCredentials: true }
  );

  const updatedReport = response.data.data;

  if (filterStatus !== "all" && updatedReport.status !== filterStatus) {
    setReports((previous) =>
      previous.filter((report) => report._id !== reportId)
    );
  } else {
    setReports((previous) =>
      previous.map((report) =>
        report._id === reportId ? updatedReport : report
      )
    );
  }

  setMessage(response.data.message || "Report updated successfully.");
} catch (err: unknown) {
  if (err && typeof err === "object" && "response" in err) {
    const apiError = err as {
      response?: { data?: { message?: string } };
    };

    setError(
      apiError.response?.data?.message || "Failed to update report."
    );
  } else {
    setError("Unable to connect to the backend.");
  }
} finally {
  setSavingId(null);
}

};

const statusStyle = (status: ReportType["status"]) => {
switch (status) {
case "pending":
return "bg-yellow-100 text-yellow-800";
case "reviewed":
return "bg-blue-100 text-blue-800";
case "resolved":
return "bg-green-100 text-green-800";
case "dismissed":
return "bg-gray-200 text-gray-700";
}
};

return ( <main className="min-h-screen bg-gray-100 p-6 md:p-10"> <div className="mx-auto max-w-7xl"> <div className="mb-8 flex flex-wrap items-center justify-between gap-4"> <div> <h1 className="text-3xl font-bold text-gray-900">
Reported Content </h1> <p className="mt-2 text-gray-600">
Review reports submitted about events. </p> </div>

      <Link
        href="/admin/dashboard"
        className="rounded-lg bg-gray-900 px-5 py-3 text-white hover:bg-gray-700"
      >
        Back to Dashboard
      </Link>
    </div>

    <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
      <label
        htmlFor="reportStatus"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Filter reports by status
      </label>

      <select
        id="reportStatus"
        value={filterStatus}
        onChange={(event) => setFilterStatus(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 sm:w-72"
      >
        <option value="all">All Reports</option>
        {reportStatuses.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    </div>

    {message && (
      <p className="mb-5 rounded-lg bg-green-100 p-4 text-green-800">
        {message}
      </p>
    )}

    {error && (
      <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => fetchReports(filterStatus)}
          className="mt-2 font-semibold underline"
        >
          Try again
        </button>
      </div>
    )}

    {loading ? (
      <p className="py-10 text-center text-gray-600">
        Loading reports...
      </p>
    ) : reports.length === 0 ? (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">
          No reports found
        </h2>
        <p className="mt-2 text-gray-500">
          There are no reports for the selected status.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {reports.map((report) => (
            <ReportCard
            key={report._id}
            report={report}
            saving={savingId === report._id}
            deleting={deletingId === report._id}
            statusStyle={statusStyle}
            onSave={handleUpdateReport}
            onDelete={handleDeleteReportedEvent}
            />

        ))}
      </div>
    )}
  </div>
</main>

);
}

function ReportCard({
report,
saving,
deleting,
statusStyle,
onSave,
onDelete,
}: {
report: ReportType;
saving: boolean;
deleting: boolean;
statusStyle: (status: ReportType["status"]) => string;
onSave: (
reportId: string,
status: ReportType["status"],
adminNote: string
) => Promise<void>;
onDelete: (report: ReportType) => Promise<void>;
}) {

const [status, setStatus] = useState<ReportType["status"]>(report.status);
const [adminNote, setAdminNote] = useState(report.adminNote || "");

useEffect(() => {
setStatus(report.status);
setAdminNote(report.adminNote || "");
}, [report.status, report.adminNote]);

return ( <article className="rounded-xl bg-white p-6 shadow-sm"> <div className="flex flex-wrap items-start justify-between gap-4"> <div> <h2 className="text-xl font-semibold text-gray-900">
{report.event?.eventName || "Event information unavailable"} </h2>

      <p className="mt-2 text-sm text-gray-600">
        Reported by:{" "}
        {report.reportedBy
          ? `${report.reportedBy.firstName} ${report.reportedBy.lastName}`
          : "Unknown user"}
      </p>

      <p className="text-sm text-gray-600">
        {report.reportedBy?.email || "No email available"}
      </p>
    </div>

    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle(
        report.status
      )}`}
    >
      {report.status}
    </span>
  </div>

  <div className="mt-5 rounded-lg bg-gray-50 p-4">
    <p className="text-sm font-semibold text-gray-700">Reason</p>
    <p className="mt-1 text-gray-900">{report.reason}</p>

    <p className="mt-4 text-sm font-semibold text-gray-700">
      Description
    </p>
    <p className="mt-1 whitespace-pre-wrap text-gray-700">
      {report.description || "No additional description provided."}
    </p>

    <p className="mt-4 text-xs text-gray-500">
      Submitted: {new Date(report.createdAt).toLocaleString()}
    </p>
  </div>

  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label
        htmlFor={`status-${report._id}`}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Update status
      </label>

      <select
        id={`status-${report._id}`}
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as ReportType["status"])
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-3"
      >
        {reportStatuses.map((item) => (
          <option key={item} value={item}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label
        htmlFor={`note-${report._id}`}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Admin note
      </label>

      <textarea
        id={`note-${report._id}`}
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Add a note about your decision..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3"
      />
    </div>
  </div>

     <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
            type="button"
            disabled={deleting || !report.event?._id}
            onClick={() => onDelete(report)}
            className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {deleting ? "Deleting Event..." : "Delete Event"}
        </button>

        <button
        type="button"
        disabled={saving || deleting}
        onClick={() => onSave(report._id, status, adminNote)}
        className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"

        >

        {saving ? "Saving..." : "Save Changes"}

        </button>
    </div>

</article>

);
}
