import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  FileText,
  UserCheck,
} from "lucide-react";
import { JobPosting } from "../../types";

export const CareersView: React.FC = () => {
  const { jobPostings, addJobApplication } = useStore();

  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const openApplyModal = (job: JobPosting) => {
    setSelectedJob(job);
    setAppliedSuccess(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setResumeUrl("");
    setCoverLetter("");
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !fullName || !email || !phone) return;

    addJobApplication({
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      fullName,
      email,
      phone,
      resumeUrl: resumeUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      coverLetter,
    });

    setAppliedSuccess(true);
  };

  const openPostings = jobPostings.filter((j) => j.status === "Open");

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Join Our Team
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900">Career Opportunities</h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Shape the future of digital retail and e-commerce technology in South Asia. Work with talented engineers, designers, and logistics leaders.
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {openPostings.length === 0 ? (
            <div className="md:col-span-2 bg-white p-12 rounded-3xl text-center space-y-3 border">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-lg">No Open Positions Currently</h3>
              <p className="text-xs text-slate-500">
                Please check back soon or submit your CV to careers@smartecom.com for future talent pooling.
              </p>
            </div>
          ) : (
            openPostings.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between space-y-6 hover:shadow-md transition"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase">
                      {job.department}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Deadline: {job.deadline}</span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> {job.employmentType}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" /> {job.salaryRange}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Exp: {job.experience}
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {job.description}
                  </p>

                  {job.responsibilities.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <h4 className="text-[11px] font-bold text-slate-700 uppercase">Responsibilities:</h4>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                        {job.responsibilities.slice(0, 3).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Posted officially by HR</span>
                  <button
                    onClick={() => openApplyModal(job)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* APPLY MODAL */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Apply for {selectedJob.title}</h3>
                <p className="text-xs text-slate-500">{selectedJob.department} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {appliedSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-lg">Application Submitted!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for applying. Our talent acquisition team will review your application and contact you if shortlisted.
                </p>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anisur Rahman"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. candidate@gmail.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +8801711223344"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Resume / CV Link (Drive / Dropbox PDF)
                  </label>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cover Letter / Statement
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly describe your experience and motivation..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
