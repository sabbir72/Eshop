import React from "react";
import { useStore } from "../../context/StoreContext";
import {
  Building2,
  Award,
  CheckCircle2,
  Users,
  Target,
  Compass,
  Sparkles,
  ShieldCheck,
  Play,
  Heart,
} from "lucide-react";

export const AboutUsView: React.FC = () => {
  const { aboutUs, setStoreView } = useStore();

  if (!aboutUs || !aboutUs.published) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">About Us page currently unavailable.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
            About Our Company
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{aboutUs.companyName}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {aboutUs.introduction}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 space-y-12">
        {/* Key Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {aboutUs.coreValues.map((val) => (
            <div
              key={val.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 space-y-3 hover:shadow-lg transition"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{val.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{val.description}</p>
            </div>
          ))}
        </div>

        {/* Company History & Video */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-lg">
              <Compass className="w-4 h-4" /> Our Journey & Heritage
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              Building South Asia's Premier E-Commerce Ecosystem
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {aboutUs.history}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-2xl font-black text-indigo-600">500,000+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Satisfied Customers</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-2xl font-black text-emerald-600">99.4%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Order Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {aboutUs.videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
                <iframe
                  src={aboutUs.videoUrl}
                  title="Company Video"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {aboutUs.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Office"
                    className="w-full h-40 object-cover rounded-2xl shadow-sm border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mission & Vision Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-3xl shadow-md space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-200">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">Our Mission</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">{aboutUs.mission}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-slate-900 text-white p-8 rounded-3xl shadow-md space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-purple-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">Our Vision</h3>
            <p className="text-purple-100 text-sm leading-relaxed">{aboutUs.vision}</p>
          </div>
        </div>

        {/* CEO Message */}
        {aboutUs.ceoMessage && (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <img
              src={aboutUs.ceoMessage.image}
              alt={aboutUs.ceoMessage.name}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-lg border-4 border-indigo-50 flex-shrink-0"
            />
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                CEO Statement
              </span>
              <p className="text-slate-700 text-base md:text-lg italic leading-relaxed">
                "{aboutUs.ceoMessage.message}"
              </p>
              <div>
                <div className="font-bold text-slate-900 text-lg">{aboutUs.ceoMessage.name}</div>
                <div className="text-xs text-slate-500 font-semibold">{aboutUs.ceoMessage.title}</div>
              </div>
            </div>
          </div>
        )}

        {/* Awards & Partners */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Awards & Recognized Partners</h3>
            <p className="text-slate-500 text-xs">Official brand certifications & industry honors</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            {aboutUs.awards.map((aw) => (
              <div key={aw.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2">
                <Award className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">{aw.title}</h4>
                <p className="text-[10px] text-slate-500">{aw.issuer} • {aw.year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
