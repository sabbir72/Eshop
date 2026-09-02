import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Building2,
  CheckCircle2,
} from "lucide-react";

export const ContactUsView: React.FC = () => {
  const { contactInfo, addContactInquiry } = useStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;

    addContactInquiry({
      fullName,
      email,
      phone,
      subject: subject || "General Customer Inquiry",
      message,
    });

    setSubmitted(true);
    setFullName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Customer Care & Contact Us
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">We're Here to Help You 24/7</h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Have questions regarding orders, bulk corporate requests, warranty, or returns? Send us a message or visit our Tejgaon office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Headquarters Contact</h3>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase">Office Address</span>
                    <span className="text-slate-200 leading-relaxed block mt-0.5">{contactInfo.officeAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase">Customer Support Phone</span>
                    <span className="text-slate-200 block font-semibold mt-0.5">{contactInfo.phone}</span>
                    <span className="text-xs text-slate-400 block">{contactInfo.mobile}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase">Email Enquiries</span>
                    <span className="text-indigo-300 block font-semibold mt-0.5">{contactInfo.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase">Business Hours</span>
                    <span className="text-slate-300 block text-xs mt-0.5">{contactInfo.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {contactInfo.whatsAppNumber && (
              <a
                href={`https://wa.me/${contactInfo.whatsAppNumber.replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg text-sm"
              >
                <MessageSquare className="w-5 h-5" /> Chat via Official WhatsApp
              </a>
            )}
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Send Us a Direct Message</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below and our customer support team will reply within 2 business hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-lg">Thank You! Your Message Received</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Our customer care supervisor has logged your inquiry. An official response will be emailed to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kamrul Hasan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. kamrul@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +880 1711 000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Warranty or Bulk Corporate Inquiry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe how we can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <Send className="w-4 h-4" /> Dispatch Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Location */}
        {contactInfo.googleMapEmbedUrl && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" /> Interactive Headquarters Location
            </h3>
            <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-slate-100 border">
              <iframe
                src={contactInfo.googleMapEmbedUrl}
                title="Office Location Map"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
