import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Globe,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  Save,
  Award,
  Users,
  Video,
  Image,
  Send,
  Filter,
} from "lucide-react";
import { AboutUsData, ContactInfoData, ContactInquiry } from "../../types";

export const CompanyCMSManagement: React.FC = () => {
  const {
    aboutUs,
    updateAboutUs,
    contactInfo,
    updateContactInfo,
    contactInquiries,
    updateContactInquiry,
    deleteContactInquiry,
    hasPermission,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"about" | "contact" | "inquiries">("about");

  // Local editable state for About Us
  const [aboutForm, setAboutForm] = useState<AboutUsData>(aboutUs);
  const [newValueTitle, setNewValueTitle] = useState("");
  const [newValueDesc, setNewValueDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newAwardTitle, setNewAwardTitle] = useState("");
  const [newAwardYear, setNewAwardYear] = useState("");
  const [newAwardIssuer, setNewAwardIssuer] = useState("");

  // Local editable state for Contact Info
  const [contactForm, setContactForm] = useState<ContactInfoData>(contactInfo);

  // Inquiry Response Modal
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");

  const canEdit = hasPermission("CMS", "edit");
  const canDelete = hasPermission("CMS", "delete");

  // About Us Handlers
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutUs(aboutForm);
  };

  const handleAddCoreValue = () => {
    if (!newValueTitle.trim()) return;
    const val = {
      id: `v-${Date.now()}`,
      title: newValueTitle,
      description: newValueDesc,
    };
    setAboutForm({ ...aboutForm, coreValues: [...aboutForm.coreValues, val] });
    setNewValueTitle("");
    setNewValueDesc("");
  };

  const handleRemoveCoreValue = (id: string) => {
    setAboutForm({
      ...aboutForm,
      coreValues: aboutForm.coreValues.filter((v) => v.id !== id),
    });
  };

  const handleAddImage = () => {
    if (!newImage.trim()) return;
    setAboutForm({ ...aboutForm, images: [...aboutForm.images, newImage] });
    setNewImage("");
  };

  const handleRemoveImage = (idx: number) => {
    setAboutForm({
      ...aboutForm,
      images: aboutForm.images.filter((_, i) => i !== idx),
    });
  };

  const handleAddAward = () => {
    if (!newAwardTitle.trim()) return;
    const award = {
      id: `a-${Date.now()}`,
      title: newAwardTitle,
      year: newAwardYear || new Date().getFullYear().toString(),
      issuer: newAwardIssuer || "E-Commerce Excellence",
    };
    setAboutForm({ ...aboutForm, awards: [...aboutForm.awards, award] });
    setNewAwardTitle("");
    setNewAwardYear("");
    setNewAwardIssuer("");
  };

  const handleRemoveAward = (id: string) => {
    setAboutForm({
      ...aboutForm,
      awards: aboutForm.awards.filter((a) => a.id !== id),
    });
  };

  // Contact Info Handlers
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactInfo(contactForm);
  };

  // Inquiry Reply Handler
  const handleSendReply = () => {
    if (!selectedInquiry || !replyText.trim()) return;
    updateContactInquiry(selectedInquiry.id, {
      status: "Responded",
      reply: replyText,
    });
    setSelectedInquiry(null);
    setReplyText("");
  };

  const filteredInquiries = contactInquiries.filter((inq) => {
    if (inquiryFilter === "all") return true;
    return inq.status.toLowerCase() === inquiryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Company & Contact Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage About Us content, Contact information, and view customer messages.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "about"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            About Us CMS
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "contact"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Contact Details
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "inquiries"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Inquiries Inbox
            {contactInquiries.filter((i) => i.status === "New").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {contactInquiries.filter((i) => i.status === "New").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: ABOUT US CMS */}
      {activeTab === "about" && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" /> General Company Profile
              </h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aboutForm.published}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, published: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  Publish Page to Storefront
                </label>
                {canEdit && (
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={aboutForm.companyName}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, companyName: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Company Video URL (YouTube Embed / MP4)
                </label>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={aboutForm.videoUrl || ""}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Company Introduction
                </label>
                <textarea
                  rows={3}
                  value={aboutForm.introduction}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, introduction: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Company History & Achievements
                </label>
                <textarea
                  rows={3}
                  value={aboutForm.history}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, history: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={aboutForm.mission}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, mission: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Vision Statement
                </label>
                <textarea
                  rows={3}
                  value={aboutForm.vision}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, vision: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* CEO Message Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
              <Users className="w-5 h-5 text-indigo-600" /> CEO / Leadership Message
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Leader Name
                </label>
                <input
                  type="text"
                  value={aboutForm.ceoMessage?.name || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      ceoMessage: {
                        ...(aboutForm.ceoMessage || { name: "", title: "", message: "" }),
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Leader Title
                </label>
                <input
                  type="text"
                  value={aboutForm.ceoMessage?.title || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      ceoMessage: {
                        ...(aboutForm.ceoMessage || { name: "", title: "", message: "" }),
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Leader Photo URL
                </label>
                <input
                  type="text"
                  value={aboutForm.ceoMessage?.image || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      ceoMessage: {
                        ...(aboutForm.ceoMessage || { name: "", title: "", message: "" }),
                        image: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={aboutForm.ceoMessage?.message || ""}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      ceoMessage: {
                        ...(aboutForm.ceoMessage || { name: "", title: "", message: "" }),
                        message: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Core Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutForm.coreValues.map((val) => (
                <div
                  key={val.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{val.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{val.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoreValue(val.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 uppercase">Add New Core Value</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Value Title (e.g. Uncompromising Quality)"
                  value={newValueTitle}
                  onChange={(e) => setNewValueTitle(e.target.value)}
                  className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  value={newValueDesc}
                  onChange={(e) => setNewValueDesc(e.target.value)}
                  className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCoreValue}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Core Value
              </button>
            </div>
          </div>

          {/* Company Image Gallery */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
              <Image className="w-5 h-5 text-indigo-600" /> Office & Facility Image Gallery
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {aboutForm.images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  <img src={imgUrl} alt={`Company ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Awards & Certifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-3 border-slate-100">
              <Award className="w-5 h-5 text-indigo-600" /> Awards & Certifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutForm.awards.map((aw) => (
                <div key={aw.id} className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{aw.title}</h4>
                      <p className="text-xs text-slate-600">{aw.issuer} • {aw.year}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAward(aw.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Award Name"
                value={newAwardTitle}
                onChange={(e) => setNewAwardTitle(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Issuer (e.g. Retail Federation)"
                value={newAwardIssuer}
                onChange={(e) => setNewAwardIssuer(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Year (e.g. 2025)"
                  value={newAwardYear}
                  onChange={(e) => setNewAwardYear(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAward}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 whitespace-nowrap"
                >
                  Add Award
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CONTACT DETAILS */}
      {activeTab === "contact" && (
        <form onSubmit={handleSaveContact} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600" /> Store Contact & Location Details
            </h2>
            {canEdit && (
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Save className="w-4 h-4" /> Save Contact Info
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Display Company Title
              </label>
              <input
                type="text"
                value={contactForm.companyName}
                onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Support Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Helpline Landline / Phone
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                WhatsApp Business Number
              </label>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  value={contactForm.whatsAppNumber}
                  onChange={(e) => setContactForm({ ...contactForm, whatsAppNumber: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Headquarters Office Address
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={contactForm.officeAddress}
                  onChange={(e) => setContactForm({ ...contactForm, officeAddress: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                value={contactForm.googleMapEmbedUrl}
                onChange={(e) => setContactForm({ ...contactForm, googleMapEmbedUrl: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Business Hours Notice
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={contactForm.businessHours}
                  onChange={(e) => setContactForm({ ...contactForm, businessHours: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl bg-slate-50">
                <input
                  type="checkbox"
                  checked={contactForm.liveChatAvailable}
                  onChange={(e) => setContactForm({ ...contactForm, liveChatAvailable: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Enable Floating Store Live Chat</span>
                  <span className="text-xs text-slate-500">Displays interactive live chat launcher widget on customer storefront</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: INQUIRIES INBOX */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Filter Inquiries:</span>
              <select
                value={inquiryFilter}
                onChange={(e) => setInquiryFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none bg-slate-50"
              >
                <option value="all">All Inquiries ({contactInquiries.length})</option>
                <option value="new">New / Unread ({contactInquiries.filter((i) => i.status === "New").length})</option>
                <option value="responded">Responded ({contactInquiries.filter((i) => i.status === "Responded").length})</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Inquiries are automatically captured from the Contact Us customer form.
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Subject & Message</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No contact inquiries found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{inq.fullName}</div>
                          <div className="text-xs text-slate-500">{inq.email}</div>
                          <div className="text-xs text-slate-400">{inq.phone}</div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{inq.subject}</div>
                          <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{inq.message}</div>
                          {inq.reply && (
                            <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                              <span className="font-bold">Replied:</span> {inq.reply}
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                          {inq.createdAt}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              inq.status === "New"
                                ? "bg-red-100 text-red-700"
                                : inq.status === "Responded"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View / Reply
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => deleteContactInquiry(inq.id)}
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
        </div>
      )}

      {/* Inquiry Detail & Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Inquiry Details</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{selectedInquiry.fullName}</span>
                  <span className="text-xs text-slate-400">{selectedInquiry.createdAt}</span>
                </div>
                <div className="text-xs text-slate-600">{selectedInquiry.email} • {selectedInquiry.phone}</div>
                <div className="font-semibold text-slate-800 mt-2">{selectedInquiry.subject}</div>
                <p className="text-slate-700 text-xs mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{selectedInquiry.message}"
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Send Email Reply to Customer
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply message..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Send Email Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
