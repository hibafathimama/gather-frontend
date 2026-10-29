"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Trash2, 
  Save, 
  Loader2, 
  User, 
  Mail, 
  Calendar, 
  Filter 
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

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
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "dismissed":
        return "bg-stone-100 text-stone-700 border border-stone-200";
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Governance
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Reported Content
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Review reports submitted by users regarding events and policy violations.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Filter Section */}
          <div className="mb-8 rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
            <label
              htmlFor="reportStatus"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
            >
              Filter Reports by Status
            </label>

            <div className="relative sm:w-80">
              <select
                id="reportStatus"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm font-medium text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
              >
                <option value="all">All Reports</option>
                {reportStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchReports(filterStatus)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 w-fit"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Content States */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
              Loading reports queue...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-16 text-center shadow-sm">
              <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-stone-400" />
              <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                No reports found
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                There are no reports matching the selected status filter.
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
    </>
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

  return (
    <article className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm transition hover:shadow-md">
      
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
            {report.event?.eventName || "Event information unavailable"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-500">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#3E000C]" />
              {report.reportedBy
                ? `${report.reportedBy.firstName} ${report.reportedBy.lastName}`
                : "Unknown user"}
            </span>

            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#3E000C]" />
              {report.reportedBy?.email || "No email available"}
            </span>
          </div>
        </div>

        <span
          className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${statusStyle(
            report.status
          )}`}
        >
          {report.status}
        </span>
      </div>

      {/* Report Body Details */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#3E000C]">Reason for Report</p>
        <p className="mt-1 text-sm font-semibold text-stone-900">{report.reason}</p>

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#3E000C]">Description</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
          {report.description || "No additional description provided."}
        </p>

        <p className="mt-4 text-xs text-stone-400 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Submitted: {new Date(report.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {/* Form Controls Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor={`status-${report._id}`}
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
          >
            Update Status
          </label>

          <select
            id={`status-${report._id}`}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReportType["status"])
            }
            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 text-sm font-medium text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
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
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
          >
            Admin Note
          </label>

          <textarea
            id={`note-${report._id}`}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Add a note about your moderation decision..."
            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
          />
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-stone-100 pt-6">
        <button
          type="button"
          disabled={deleting || !report.event?._id}
          onClick={() => onDelete(report)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Deleting Event...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" /> Delete Event
            </>
          )}
        </button>

        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => onSave(report._id, status, adminNote)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3E000C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Changes
            </>
          )}
        </button>
      </div>

    </article>
  );
}