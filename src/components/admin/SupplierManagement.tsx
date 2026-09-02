import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { PrintableDocumentData } from "../../types/print";
import { buildReportPrintData } from "../../utils/printDocumentBuilder";
import { EnterprisePrintModal } from "../common/EnterprisePrintModal";
import {
  Truck,
  FileText,
  BadgeCheck,
  TrendingUp,
  Tag,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Building,
  Mail,
  Phone,
  DollarSign,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Send,
  Download,
  Printer,
} from "lucide-react";

interface SupplierInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  categoryNeeded: string;
  estimatedQuantity: number;
  targetPricePerUnit: number;
  message: string;
  status: "New" | "In Review" | "Quoted" | "Approved" | "Closed";
  submittedAt: string;
  notes?: string;
}

interface VerifiedSupplier {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  verificationBadge: "Gold Supplier" | "Verified Manufacturer" | "Premium Partner";
  yearsInBusiness: number;
  rating: fontRating;
  totalOrdersFulfilled: number;
  status: "Active" | "Suspended";
  contactEmail: string;
}

type fontRating = number;

interface SupplierPromotion {
  id: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  targetCategory: string;
  minimumOrderQuantity: number;
  isActive: boolean;
  validUntil: string;
}

export const SupplierManagement: React.FC = () => {
  const { addToast } = useStore();
  const [activeTab, setActiveTab] = useState<
    "inquiries" | "promotions" | "requests" | "suppliers" | "analytics"
  >("inquiries");

  // State for Supplier Inquiries
  const [inquiries, setInquiries] = useState<SupplierInquiry[]>([
    {
      id: "RFQ-1001",
      companyName: "Apex Retail Solutions Ltd.",
      contactPerson: "Mahmud Hasan",
      email: "mahmud@apexsolutions.bd",
      phone: "+880 1711-223344",
      categoryNeeded: "Electronics & Smart Accessories",
      estimatedQuantity: 500,
      targetPricePerUnit: 2400,
      message: "Looking for wholesale supply of noise-cancelling wireless earbuds with custom company logo printing.",
      status: "New",
      submittedAt: "2026-07-22 14:30",
    },
    {
      id: "RFQ-1002",
      companyName: "Dhaka Trade Overseas",
      contactPerson: "Nusrat Jahan",
      email: "nusrat@dhakatrade.com",
      phone: "+880 1819-887766",
      categoryNeeded: "Men's Apparel & Formal Wear",
      estimatedQuantity: 1200,
      targetPricePerUnit: 950,
      message: "Need bulk quotation for 100% combed cotton Oxford formal shirts in 4 size assortments.",
      status: "In Review",
      submittedAt: "2026-07-20 11:15",
    },
    {
      id: "RFQ-1003",
      companyName: "Bengal Tech Hub",
      contactPerson: "Tanvir Ahmed",
      email: "tanvir@bengaltech.io",
      phone: "+880 1912-334455",
      categoryNeeded: "Computers & Office Equipment",
      estimatedQuantity: 150,
      targetPricePerUnit: 45000,
      message: "Requesting B2B proforma invoice for ergonomic office chairs and dual-monitor arms for new tech hub.",
      status: "Quoted",
      submittedAt: "2026-07-18 09:45",
      notes: "Sent proforma quote with 8% corporate volume discount.",
    },
  ]);

  // State for Verified Suppliers
  const [suppliers, setSuppliers] = useState<VerifiedSupplier[]>([
    {
      id: "SUP-01",
      name: "Shenzhen Precision Electronics Co.",
      logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80",
      category: "Electronics & Gadgets",
      country: "China",
      verificationBadge: "Gold Supplier",
      yearsInBusiness: 12,
      rating: 4.9,
      totalOrdersFulfilled: 3420,
      status: "Active",
      contactEmail: "export@szprecision.cn",
    },
    {
      id: "SUP-02",
      name: "Chittagong Garments & Textile Mills",
      logo: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=150&q=80",
      category: "Fashion & Apparel",
      country: "Bangladesh",
      verificationBadge: "Verified Manufacturer",
      yearsInBusiness: 8,
      rating: 4.8,
      totalOrdersFulfilled: 1890,
      status: "Active",
      contactEmail: "b2b@ctgtextiles.com.bd",
    },
    {
      id: "SUP-03",
      name: "Nordic Home Crafts Europe",
      logo: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80",
      category: "Home & Furniture",
      country: "Denmark",
      verificationBadge: "Premium Partner",
      yearsInBusiness: 15,
      rating: 4.9,
      totalOrdersFulfilled: 920,
      status: "Active",
      contactEmail: "orders@nordichome.dk",
    },
  ]);

  // State for B2B Offer Campaigns & Promotions
  const [promotions, setPromotions] = useState<SupplierPromotion[]>([
    {
      id: "PROMO-01",
      title: "Get US $10 Off with New Verified Supplier",
      subtitle: "Special introductory incentive for verified corporate procurement accounts.",
      discountBadge: "$10 OFF First Order",
      targetCategory: "All Categories",
      minimumOrderQuantity: 10,
      isActive: true,
      validUntil: "2026-12-31",
    },
    {
      id: "PROMO-02",
      title: "Bulk Volume Tiering: 12% Off Gadgets",
      subtitle: "Order 100+ units of smart watches or earbuds and unlock direct manufacturer rates.",
      discountBadge: "12% Wholesale Rate",
      targetCategory: "Electronics",
      minimumOrderQuantity: 100,
      isActive: true,
      validUntil: "2026-09-30",
    },
  ]);

  // Modals & Selected items
  const [selectedInquiry, setSelectedInquiry] = useState<SupplierInquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [activePrintData, setActivePrintData] = useState<PrintableDocumentData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const openPrintModal = (data: PrintableDocumentData) => {
    setActivePrintData(data);
    setIsPrintModalOpen(true);
  };

  const handleUpdateInquiryStatus = (id: string, newStatus: SupplierInquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    addToast(`Inquiry ${id} status updated to ${newStatus}`, "success");
  };

  const handleSendReply = () => {
    if (!selectedInquiry) return;
    addToast(`Response sent to ${selectedInquiry.contactPerson} (${selectedInquiry.email})`, "success");
    handleUpdateInquiryStatus(selectedInquiry.id, "Quoted");
    setSelectedInquiry(null);
    setReplyMessage("");
  };

  const handleTogglePromo = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    addToast("Promotion campaign status updated", "info");
  };

  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inq.contactPerson.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inq.categoryNeeded.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
              Admin Exclusive Module
            </span>
            <span className="text-xs text-indigo-300 font-semibold">B2B Wholesale Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Supplier & B2B Management</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Manage wholesale RFQ inquiries, verified supplier directory, B2B offer campaigns, supplier applications, and procurement analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("inquiries")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>RFQs ({inquiries.filter((i) => i.status === "New").length} New)</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border ${
            activeTab === "inquiries"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100"
              : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Supplier Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border ${
            activeTab === "suppliers"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100"
              : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Verified Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("promotions")}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border ${
            activeTab === "promotions"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100"
              : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Supplier Promotions ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border ${
            activeTab === "analytics"
              ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100"
              : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Procurement Analytics</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER INQUIRIES & RFQs */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search RFQs by company or category..."
                className="w-full bg-slate-50 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredInquiries.length}</strong> supplier inquiry requests
            </div>
          </div>

          {/* Table of Inquiries */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">RFQ ID</th>
                    <th className="py-3 px-4">Company & Contact</th>
                    <th className="py-3 px-4">Category Needed</th>
                    <th className="py-3 px-4 text-center">Est. Quantity</th>
                    <th className="py-3 px-4 text-right">Target Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inq.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inq.companyName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{inq.contactPerson}</span>
                          <span>•</span>
                          <span>{inq.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{inq.categoryNeeded}</td>
                      <td className="py-3 px-4 text-center font-bold">{inq.estimatedQuantity.toLocaleString()} pcs</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ৳{inq.targetPricePerUnit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            inq.status === "New"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : inq.status === "In Review"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : inq.status === "Quoted"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded-lg transition-colors border border-indigo-100"
                          >
                            Review & Reply
                          </button>

                          <button
                            onClick={() =>
                              openPrintModal({
                                documentType: "purchase_order",
                                documentTitle: "OFFICIAL PURCHASE ORDER / RFQ",
                                documentNumber: inq.id,
                                status: inq.status,
                                generatedDate: inq.submittedAt.split(" ")[0] || new Date().toLocaleDateString(),
                                generatedTime: inq.submittedAt.split(" ")[1] || "10:00 AM",
                                generatedBy: "Procurement Manager",

                                supplierInfo: {
                                  name: inq.companyName,
                                  company: inq.companyName,
                                  contactPerson: inq.contactPerson,
                                  email: inq.email,
                                  phone: inq.phone,
                                },

                                items: [
                                  {
                                    id: inq.id,
                                    name: inq.categoryNeeded,
                                    sku: `RFQ-${inq.id}`,
                                    quantity: inq.estimatedQuantity,
                                    unitPrice: inq.targetPricePerUnit,
                                    total: inq.estimatedQuantity * inq.targetPricePerUnit,
                                    notes: inq.message,
                                  },
                                ],

                                subtotal: inq.estimatedQuantity * inq.targetPricePerUnit,
                                grandTotal: inq.estimatedQuantity * inq.targetPricePerUnit,
                                notes: inq.message,
                                termsConditions:
                                  "Delivery must strictly adhere to requested specs. Payment terms subject to formal wholesale agreement. Defective items subject to immediate RMA credit note.",
                                signaturesNeeded: ["Authorized Procurement Officer", "Supplier Representative Acceptance"],
                              })
                            }
                            className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 inline-flex items-center gap-1"
                            title="Print Purchase Order / RFQ"
                          >
                            <Printer className="w-3.5 h-3.5" /> PO
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFIED SUPPLIERS DIRECTORY */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-start justify-between gap-3">
                <img src={sup.logo} alt={sup.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase rounded-full">
                  {sup.verificationBadge}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{sup.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{sup.category} • {sup.country}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Years Active</span>
                  <span className="font-extrabold text-slate-900">{sup.yearsInBusiness} Years</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Fulfilled Orders</span>
                  <span className="font-extrabold text-indigo-600">{sup.totalOrdersFulfilled}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {sup.contactEmail}
                </span>
                <span className="font-black text-amber-500">★ {sup.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SUPPLIER PROMOTIONS & B2B OFFERS */}
      {activeTab === "promotions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Active B2B Offer Campaigns</h3>
              <p className="text-xs text-slate-500">
                Incentive campaigns shown exclusively in B2B accounts or corporate client RFQ dashboards.
              </p>
            </div>

            <button
              onClick={() => {
                const newPromo: SupplierPromotion = {
                  id: `PROMO-${Date.now()}`,
                  title: "15% Off Bulk Textile Orders",
                  subtitle: "Exclusive tier discount for verified fashion apparel orders exceeding 200 pcs.",
                  discountBadge: "15% Off Bulk",
                  targetCategory: "Fashion",
                  minimumOrderQuantity: 200,
                  isActive: true,
                  validUntil: "2026-11-30",
                };
                setPromotions((prev) => [newPromo, ...prev]);
                addToast("New B2B Promotion Campaign added!", "success");
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create B2B Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full">
                    {promo.discountBadge}
                  </span>
                  <button
                    onClick={() => handleTogglePromo(promo.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      promo.isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {promo.isActive ? "Active" : "Disabled"}
                  </button>
                </div>

                <h3 className="text-base font-extrabold tracking-tight">{promo.title}</h3>
                <p className="text-xs text-slate-300">{promo.subtitle}</p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Min Order: <strong>{promo.minimumOrderQuantity} pcs</strong></span>
                  <span>Expires: <strong>{promo.validUntil}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROCUREMENT ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Wholesale RFQs</span>
            <div className="text-2xl font-black text-slate-900">128 Enquiries</div>
            <p className="text-[11px] text-emerald-600 font-semibold">+18% vs last month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Converted Bulk Contracts</span>
            <div className="text-2xl font-black text-indigo-600">42 Approved</div>
            <p className="text-[11px] text-indigo-600 font-semibold">32.8% Conversion Rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Manufacturers</span>
            <div className="text-2xl font-black text-slate-900">24 Active</div>
            <p className="text-[11px] text-slate-500 font-semibold">China, BD, Vietnam, EU</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Wholesale Order Value</span>
            <div className="text-2xl font-black text-emerald-600">৳ 4,850,000</div>
            <p className="text-[11px] text-emerald-600 font-semibold">Avg RFQ Ticket: ৳115,000</p>
          </div>
        </div>
      )}

      {/* REVIEW & REPLY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600">Review Wholesale RFQ</span>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedInquiry.companyName}</h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 text-xs border border-slate-200">
              <p><strong>Contact:</strong> {selectedInquiry.contactPerson} ({selectedInquiry.email} | {selectedInquiry.phone})</p>
              <p><strong>Category Needed:</strong> {selectedInquiry.categoryNeeded}</p>
              <p><strong>Est. Quantity:</strong> {selectedInquiry.estimatedQuantity} units</p>
              <p><strong>Target Unit Price:</strong> ৳{selectedInquiry.targetPricePerUnit.toLocaleString()}</p>
              <p className="pt-1 text-slate-700 italic border-t border-slate-200">"{selectedInquiry.message}"</p>
            </div>

            <div className="space-y-2">
              <label className="font-extrabold text-xs text-slate-800 block">Proforma Quote / Official Reply Message</label>
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Enter quotation pricing, lead times, or bulk contract terms to send to client..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSendReply}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Formal Quote</span>
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

