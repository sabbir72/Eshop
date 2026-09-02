import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  Briefcase,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  MapPin,
  DollarSign,
  UserCheck,
  Eye,
  Download,
  Printer,
} from "lucide-react";
import { JobPosting, JobApplication } from "../../types";

export const CareersManagement: React.FC = () => {
  const {
    jobPostings,
    addJobPosting,
    updateJobPosting,
    deleteJobPosting,
    jobApplications,
    updateJobApplication,
    deleteJobApplication,
    hasPermission,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"postings" | "applications">("postings");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  // Job Posting Modal State
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Tejgaon, Dhaka (Hybrid)");
  const [employmentType, setEmploymentType] = useState<JobPosting["employmentType"]>("Full-time");
  const [experience, setExperience] = useState("2-4 Years");
  const [salaryRange, setSalaryRange] = useState("৳50,000 - ৳80,000 / month");
  const [deadline, setDeadline] = useState("2026-09-01");
  const [description, setDescription] = useState("");
  const [responsibilitiesStr, setResponsibilitiesStr] = useState("");
  const [requirementsStr, setRequirementsStr] = useState("");
  const [jobStatus, setJobStatus] = useState<JobPosting["status"]>("Open");

  // Application Detail Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const canEdit = hasPermission("Careers", "edit");
  const canDelete = hasPermission("Careers", "delete");

  const openNewJobModal = () => {
    setEditingJobId(null);
    setJobTitle("");
    setDepartment("Engineering");
    setLocation("Tejgaon, Dhaka (Hybrid)");
    setEmploymentType("Full-time");
    setExperience("2-4 Years");
    setSalaryRange("৳50,000 - ৳80,000 / month");
    setDeadline("2026-09-01");
    setDescription("");
    setResponsibilitiesStr("");
    setRequirementsStr("");
    setJobStatus("Open");
    setShowPostingModal(true);
  };

  const openEditJobModal = (job: JobPosting) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setEmploymentType(job.employmentType);
    setExperience(job.experience);
    setSalaryRange(job.salaryRange);
    setDeadline(job.deadline);
    setDescription(job.description);
    setResponsibilitiesStr(job.responsibilities.join("\n"));
    setRequirementsStr(job.requirements.join("\n"));
    setJobStatus(job.status);
    setShowPostingModal(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const responsibilities = responsibilitiesStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const requirements = requirementsStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingJobId) {
      updateJobPosting(editingJobId, {
        title: jobTitle,
        department,
        location,
        employmentType,
        experience,
        salaryRange,
        deadline,
        description,
        responsibilities,
        requirements,
        status: jobStatus,
      });
    } else {
      addJobPosting({
        title: jobTitle,
        department,
        location,
        employmentType,
        experience,
        salaryRange,
        deadline,
        description,
        responsibilities,
        requirements,
        status: jobStatus,
      });
    }
    setShowPostingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Careers & Recruitment Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage job vacancies, specifications, and review applicant resumes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "postings") {
                const headers = ["Job Title", "Department", "Location", "Type", "Experience", "Salary", "Deadline", "Status"];
                const rawRows = jobPostings.map((j) => [
                  j.title,
                  j.department,
                  j.location,
                  j.employmentType,
                  j.experience,
                  j.salaryRange,
                  j.deadline,
                  j.status,
                ]);
                openPrintModal(buildReportPrintData("CAREERS & JOB VACANCIES REPORT", headers, rawRows, "careers_report"));
              } else {
                const headers = ["Applicant Name", "Job Applied", "Email", "Phone", "Exp", "Expected Salary", "Status", "Date"];
                const rawRows = jobApplications.map((a) => [
                  a.applicantName,
                  a.jobTitle,
                  a.email,
                  a.phone,
                  a.experience,
                  a.expectedSalary,
                  a.status,
                  a.appliedAt,
                ]);
                openPrintModal(buildReportPrintData("RECRUITMENT APPLICANT ROSTER REPORT", headers, rawRows, "applicants_report"));
              }
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print HR Report
          </button>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">

            <button
              onClick={() => setActiveTab("postings")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "postings"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Job Vacancies ({jobPostings.length})
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "applications"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Applicants ({jobApplications.length})
            </button>
          </div>

          {canEdit && (
            <button
              onClick={openNewJobModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Create Vacancy
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: JOB POSTINGS LIST */}
      {activeTab === "postings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobPostings.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase">
                      {job.department}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{job.title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      job.status === "Open"
                        ? "bg-emerald-100 text-emerald-800"
                        : job.status === "Closed"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.employmentType}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salaryRange}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Deadline: {job.deadline}
                  </div>
                </div>

                <p className="text-slate-600 text-xs line-clamp-2 pt-2 border-t border-slate-100">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400">
                  Applications:{" "}
                  <strong className="text-slate-700">
                    {jobApplications.filter((a) => a.jobId === job.id).length}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditJobModal(job)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => deleteJobPosting(job.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: APPLICATIONS LIST */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Applied Position</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {jobApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No job applications received yet.
                    </td>
                  </tr>
                ) : (
                  jobApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.fullName}</div>
                        <div className="text-xs text-slate-500">{app.email}</div>
                        <div className="text-xs text-slate-400">{app.phone}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{app.jobTitle}</div>
                      </td>

                      <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                        {app.appliedAt}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            updateJobApplication(app.id, {
                              status: e.target.value as JobApplication["status"],
                            })
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold outline-none border cursor-pointer ${
                            app.status === "Hired"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : app.status === "Shortlisted"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : app.status === "Under Review"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : app.status === "Rejected"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Resume / Details
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => deleteJobApplication(app.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB VACANCY MODAL */}
      {showPostingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveJob}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingJobId ? "Edit Job Vacancy" : "Create New Job Vacancy"}
              </h3>
              <button
                type="button"
                onClick={() => setShowPostingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Position Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend React Developer"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering & Tech"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(e.target.value as JobPosting["employmentType"])
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Experience Required
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value as JobPosting["status"])}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Open">Open (Visible on Careers page)</option>
                  <option value="Closed">Closed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Key Responsibilities (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={responsibilitiesStr}
                  onChange={(e) => setResponsibilitiesStr(e.target.value)}
                  placeholder="Develop React 18 web apps&#10;Optimize checkout flow..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Requirements & Qualifications (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={requirementsStr}
                  onChange={(e) => setRequirementsStr(e.target.value)}
                  placeholder="3+ years React experience&#10;Bachelor in CS or equivalent..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowPostingModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                Save Job Vacancy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APPLICANT RESUME MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedApp.fullName}</h3>
                <p className="text-xs text-slate-500">Applied for {selectedApp.jobTitle}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div><span className="font-bold">Email:</span> {selectedApp.email}</div>
                <div><span className="font-bold">Phone:</span> {selectedApp.phone}</div>
                <div><span className="font-bold">Applied On:</span> {selectedApp.appliedAt}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-1">Cover Letter</h4>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedApp.coverLetter || "No cover letter provided."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-1">Attached Resume / CV</h4>
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition"
                >
                  <FileText className="w-4 h-4" /> View / Download Candidate CV (PDF)
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activePrintData && (
        <EnterprisePrintModal
          data={activePrintData}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

