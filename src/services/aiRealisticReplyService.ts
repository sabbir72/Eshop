/**
 * Realistic and Dynamic AI Agent Reply Engine
 * Provides culturally authentic, context-aware, and actionable responses
 * in Bengali and English for Customer Handling, Live Chat, and Service Desk.
 */

export interface CustomerHandlingParams {
  customerMessage: string;
  customerType?: string;
  sentiment?: string;
  channel?: string;
  customerName?: string;
  storeContext?: {
    productsCount?: number;
    ordersCount?: number;
    totalRevenue?: number;
    sampleProducts?: Array<{ name: string; price: number; category?: string }>;
    deliveryChargeDhaka?: number;
    deliveryChargeOutside?: number;
    returnDays?: number;
  };
}

export interface CustomerHandlingResult {
  detectedSentiment: string;
  urgencyLevel: "High" | "Medium" | "Low";
  suggestedResponseBengali: string;
  suggestedResponseEnglish: string;
  negotiationTactic: string;
  recommendedAction: string;
  objectionHandled: string;
  quickAction?: {
    type: "coupon" | "tracking" | "support_hotline" | "product_link";
    value: string;
    label: string;
  };
}

export interface ServiceResolutionParams {
  ticketId: string;
  issueType: string;
  customerName: string;
  orderId?: string;
  complaintDetails: string;
  storeContext?: any;
}

export interface ServiceResolutionResult {
  ticketId: string;
  empathyRating: string;
  resolutionStatus: string;
  officialReplyBengali: string;
  officialReplyEnglish: string;
  policyCheck: string;
  suggestedCompensation: string;
  actionSteps: string[];
}

export interface AdminChatParams {
  message: string;
  history?: Array<{ role: string; text: string }>;
  storeContext?: {
    productsCount?: number;
    ordersCount?: number;
    totalRevenue?: number;
    sampleProducts?: Array<{ name: string; price: number; category?: string }>;
  };
}

// ---------------------------------------------------------------------------
// 1. DYNAMIC CUSTOMER HANDLING & LIVE CHAT REPLY GENERATOR
// ---------------------------------------------------------------------------
export function generateRealisticCustomerReply(params: CustomerHandlingParams): CustomerHandlingResult {
  const msg = (params.customerMessage || "").trim();
  const lower = msg.toLowerCase();
  const name = params.customerName || "সম্মানিত ক্রেতা";
  const sampleProducts = params.storeContext?.sampleProducts || [];
  const dhakaDelivery = params.storeContext?.deliveryChargeDhaka || 60;
  const outsideDelivery = params.storeContext?.deliveryChargeOutside || 120;
  const returnPolicyDays = params.storeContext?.returnDays || 7;

  // Extract order code if present (e.g., ORD-8942, #8942, TCK-1024)
  const orderMatch = msg.match(/(ORD-[\w\d]+|TCK-[\w\d]+|#\d{4,8})/i);
  const foundOrderCode = orderMatch ? orderMatch[1].toUpperCase() : null;

  // 1. DELIVERY DELAY & TRACKING INQUIRY
  if (
    lower.includes("কবে পাব") ||
    lower.includes("কখন আসবে") ||
    lower.includes("কখন পাব") ||
    lower.includes("ডেলিভারি") ||
    lower.includes("delivery") ||
    lower.includes("track") ||
    lower.includes("delay") ||
    lower.includes("late") ||
    lower.includes("পৌঁছায়নি") ||
    lower.includes("কুরিয়ার") ||
    lower.includes("courier") ||
    lower.includes("রাইডার") ||
    lower.includes("পাচ্ছি না") ||
    foundOrderCode
  ) {
    const orderRef = foundOrderCode ? `অর্ডার ${foundOrderCode}` : "আপনার অর্ডারটি";
    return {
      detectedSentiment: lower.includes("late") || lower.includes("দেরি") || lower.includes("বিলম্ব") ? "Frustrated / Anxious" : "Inquiring / Expectant",
      urgencyLevel: "High",
      suggestedResponseBengali: `আসসালামু আলাইকুম ${name}! 🙏 ${orderRef} নিয়ে আপনার উদ্বেগের বিষয়টি আমরা গুরুত্বের সাথে দেখছি। আমাদের লজিস্টিকস রেকর্ড অনুযায়ী, ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে (চার্জ ৳${dhakaDelivery}) এবং ঢাকার বাইরে Steadfast/Pathao কুরিয়ারে ২-৪ কার্যদিবসের মধ্যে (চার্জ ৳${outsideDelivery}) পার্সেল ডেলিভারি সম্পন্ন হয়। আপনার পার্সেলটি ডিসপ্যাচ হাব থেকে ট্র্যাকিংয়ে রয়েছে এবং ডেলিভারির পূর্বে রাইডার আপনাকে সরাসরি ফোনে যোগাযোগ করবেন। কোনো জরুরি প্রয়োজনে আমাদের সাপোর্ট টিম রাইডারের সাথে সরাসরি সমন্বয় করে দিতে প্রস্তুত।`,
      suggestedResponseEnglish: `Hello ${name}! Thank you for checking in on ${foundOrderCode || "your order"}. Deliveries within Dhaka take 24-48 hours (৳${dhakaDelivery}) and outside Dhaka take 2-4 business days (৳${outsideDelivery}) via Steadfast / Pathao courier. Your parcel is in active transit and the delivery rider will call your phone prior to arrival. We are closely monitoring the dispatch to ensure prompt handover.`,
      negotiationTactic: "Empathetic Dispatch Transparency & Real-Time Tracking Assurance",
      recommendedAction: "Verify courier dispatch status with Steadfast/Pathao API and send rider contact via SMS",
      objectionHandled: "Delivery Delay & Tracking Transparency",
      quickAction: {
        type: "tracking",
        value: foundOrderCode || "ACTIVE-PARCEL",
        label: "Track Courier Status",
      },
    };
  }

  // 2. PRICE BARGAINING / COMPETITOR PRICE COMPARISON
  if (
    lower.includes("দাম") ||
    lower.includes("কমানো") ||
    lower.includes("discount") ||
    lower.includes("কুপন") ||
    lower.includes("offer") ||
    lower.includes("অফার") ||
    lower.includes("বেশি") ||
    lower.includes("দামি") ||
    lower.includes("অন্য দোকানে") ||
    lower.includes("কম রাখা যায়") ||
    lower.includes("bargain") ||
    lower.includes("price")
  ) {
    const couponCode = "WELCOME5";
    return {
      detectedSentiment: "Price Sensitive & Hesitant",
      urgencyLevel: "Medium",
      suggestedResponseBengali: `ধন্যবাদ আপনার আন্তরিক মতামতের জন্য! 😊 আমরা সম্পূর্ণ ১০০% অথেনটিক ব্র্যান্ড পণ্য, অফিসিয়াল ইনভয়েস এবং ${returnPolicyDays} দিনের ঝামেলামুক্ত রিপ্লেসমেন্ট ওয়ারেন্টি নিশ্চিত করি, যা বাজারে অনেক অননুমোদিত সেলার দিতে পারে না। আমাদের পণ্যের প্রিমিয়াম কোয়ালিটি ও আফটার-সেলস সার্ভিসের সাথে আপস করা হয় না। তবে আপনার কেনাকাটা আরও আনন্দদায়ক করতে আপনার জন্য একটি বিশেষ ৫% লয়্যালটি কুপন কোড '${couponCode}' সক্রিয় করে দিচ্ছি। এছাড়া ৳১,৫০০ টাকার অর্ডারে থাকছে ফ্রি ডেলিভারি সুবিধা! আপনি কি অর্ডারটি কনফার্ম করতে আগ্রহী?`,
      suggestedResponseEnglish: `Thank you for sharing your thoughts! We pride ourselves on 100% genuine brand authenticity, verified warranty, and ${returnPolicyDays}-day hassle-free doorstep replacement guarantee. While unauthorized sellers may undercut prices, we ensure genuine quality and after-sales support. To welcome you, please enjoy a 5% discount using coupon code '${couponCode}' at checkout!`,
      negotiationTactic: "Value & Authenticity Defense with Immediate Loyalty Incentive",
      recommendedAction: `Apply voucher '${couponCode}' and remind customer of ৳1,500+ free delivery perk`,
      objectionHandled: "Price Sensitivity & Competitor Undercutting",
      quickAction: {
        type: "coupon",
        value: couponCode,
        label: `Apply ${couponCode} for 5% Off`,
      },
    };
  }

  // 3. DAMAGED / DEFECTIVE / WRONG PRODUCT / RETURN / RMA
  if (
    lower.includes("ভাঙা") ||
    lower.includes("নষ্ট") ||
    lower.includes("খারাপ") ||
    lower.includes("ত্রুটি") ||
    lower.includes("damage") ||
    lower.includes("broken") ||
    lower.includes("faulty") ||
    lower.includes("wrong") ||
    lower.includes("ভুল") ||
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("রিটার্ন") ||
    lower.includes("রিফান্ড") ||
    lower.includes("বদল") ||
    lower.includes("exchange") ||
    lower.includes("ছেঁড়া")
  ) {
    return {
      detectedSentiment: "Dissatisfied / Distressed",
      urgencyLevel: "High",
      suggestedResponseBengali: `অত্যন্ত আন্তরিকভাবে দুঃখ প্রকাশ করছি এই অনাকাঙ্ক্ষিত অভিজ্ঞতার জন্য! 🙏 আমাদের সম্মানিত কোনো গ্রাহক এমন পরিস্থিতির সম্মুখীন হোক তা আমরা কখনোই চাই না। নিশ্চিন্ত থাকুন, আমাদের ${returnPolicyDays} দিনের 'জিরো-কোয়েশ্চন' রিপ্লেসমেন্ট এবং রিফান্ড পলিসি রয়েছে। কোনো অতিরিক্ত ডেলিভারি চার্জ ছাড়াই আমাদের কুরিয়ার প্রতিনিধি আপনার ঠিকানা থেকে পণ্যটি সংগ্রহ করবেন এবং অবিলম্বে ফ্রেশ নতুন পণ্য পাঠানো হবে অথবা বিকাশ/নগদে সম্পূর্ণ টাকা রিফান্ড করা হবে। দয়া করে প্যাকেটের ও ত্রুটির একটি ছোট ছবি বা ভিডিও আমাদের ইনবক্সে দিন, আমরা আজই পিকআপ শিডিউল করছি।`,
      suggestedResponseEnglish: `We sincerely apologize for this distressing experience! Please rest assured that you are fully protected by our ${returnPolicyDays}-day zero-hassle return and replacement guarantee. We will arrange a free courier pickup from your doorstep with 0 pickup fee, and immediately provide a brand-new replacement or 100% refund via bKash/Nagad. Please share a quick photo of the item and box so our RMA team can authorize immediate pickup.`,
      negotiationTactic: "Deep Empathy, Immediate Accountability & Zero-Cost RMA Promise",
      recommendedAction: "Create urgent RMA replacement ticket and issue free reverse courier pickup slip",
      objectionHandled: "Product Defect / Transit Damage Trust Repair",
      quickAction: {
        type: "support_hotline",
        value: "09612-888999",
        label: "Call Support Helpline",
      },
    };
  }

  // 4. PAYMENT & MFS (bKash / Nagad / Failed Deduction)
  if (
    lower.includes("bkash") ||
    lower.includes("বিকাশ") ||
    lower.includes("নগদ") ||
    lower.includes("nagad") ||
    lower.includes("rocket") ||
    lower.includes("payment") ||
    lower.includes("পেমেন্ট") ||
    lower.includes("টাকা কেটেছে") ||
    lower.includes("টাকা") ||
    lower.includes("failed") ||
    lower.includes("trxid") ||
    lower.includes("trx") ||
    lower.includes("গেটওয়ে") ||
    lower.includes("sslcommerz") ||
    lower.includes("cod") ||
    lower.includes("ক্যাশ অন")
  ) {
    return {
      detectedSentiment: "Concerned / Payment Hesitation",
      urgencyLevel: "High",
      suggestedResponseBengali: `আপনার পেমেন্ট সংক্রান্ত বার্তার জন্য ধন্যবাদ! 💳 যদি বিকাশ/নগদ/কার্ড থেকে ব্যালেন্স কর্তন হয়ে থাকে কিন্তু অর্ডার নিশ্চিতকরণ দেখতে না পান, দয়া করে আপনার ট্রানজেকশন আইডি (TrxID) বা প্রেরক মোবাইল নম্বরটি শেয়ার করুন। গেটওয়ে সার্ভার আপডেটের কারণে সাধারণত ১৫-২০ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে ট্রানজেকশন সিঙ্ক হয়ে যায়। কোনো অতিরিক্ত চার্জ কর্তন হলে তা বাংলাদেশ ব্যাংকের অটো-রিভার্সাল নিয়মে ২৪-৪৮ ঘণ্টার মধ্যে আপনার ওয়ালেটে ফেরত চলে আসবে। এছাড়াও নিশ্চিন্তে কেনাকাটা করতে আমাদের ক্যাশ অন ডেলিভারি (COD) সুবিধাও সর্বদা সক্রিয় রয়েছে!`,
      suggestedResponseEnglish: `Thank you for reaching out regarding payment! 💳 If money was debited from your bKash, Nagad, or card but the order confirmation is pending, please share your Transaction ID (TrxID) and mobile number. Most gateway handshakes finalize within 15-20 minutes. If duplicate debits occurred, funds are guaranteed to be auto-reversed to your original wallet within 24-48 hours. Alternatively, Cash on Delivery (COD) is always available across Bangladesh!`,
      negotiationTactic: "Fintech Security Reassurance & Alternative Zero-Risk Payment Method",
      recommendedAction: "Cross-reference TrxID in merchant portal and manually confirm order status",
      objectionHandled: "Payment Security & Failed Debit Anxiety",
      quickAction: {
        type: "support_hotline",
        value: "09612-888999",
        label: "Instant Payment Support",
      },
    };
  }

  // 5. AUTHENTICITY / ORIGINAL / WARRANTY INQUIRY
  if (
    lower.includes("আসল") ||
    lower.includes("original") ||
    lower.includes("authentic") ||
    lower.includes("warranty") ||
    lower.includes("ওয়ারেন্টি") ||
    lower.includes("গ্যারান্টি") ||
    lower.includes("নকল") ||
    lower.includes("copy") ||
    lower.includes("কপি") ||
    lower.includes("master copy") ||
    lower.includes("reconditioned")
  ) {
    return {
      detectedSentiment: "Skeptical & Quality Conscious",
      urgencyLevel: "Medium",
      suggestedResponseBengali: `আমরা আপনার উদ্বেগকে শতভাগ সম্মান করি। 🛡️ স্মার্টশপে বিক্রি হওয়া প্রতিটি পণ্য সরাসরি অনুমোদিত ব্র্যান্ড ডিস্ট্রিবিউটর ও অফিসিয়াল ইমপোর্টারদের থেকে সংগ্রহ করা হয়। কোনো প্রকার মাস্টার কপি বা ক্লোন পণ্য আমরা সরবরাহ করি না। প্রতিটি বক্সের সাথে অফিশিয়াল ইনভয়েস এবং সিল-ইনট্যাক্ট ওয়ারেন্টি স্টিকার সংযুক্ত থাকে। ডেলিভারিম্যান আসার পর পার্সেল রিসিভ করার সময় আনবক্সিং করে চেক করার সুযোগ পাবেন। কোনো ধরণের গরমিল পেলে সাথে সাথে রিটার্ন করতে পারবেন কোনো চার্জ ছাড়াই।`,
      suggestedResponseEnglish: `We completely understand and appreciate your vigilance! 🛡️ Every single item on SmartShop is 100% genuine, sourced directly from authorized brand distributors with intact factory seals. We do not sell copies or refurbished units. Each package includes an official tax invoice and brand warranty documentation. You can also inspect the outer parcel upon arrival before completing cash on delivery handover!`,
      negotiationTactic: "Unconditional Brand Authenticity & Seal-Check Guarantee",
      recommendedAction: "Reassure customer with official invoice copy and unboxing guideline",
      objectionHandled: "Skepticism of Counterfeit / Clone Goods",
      quickAction: {
        type: "coupon",
        value: "GENUINE10",
        label: "10% Authenticity Guarantee Voucher",
      },
    };
  }

  // 6. PRODUCT RECOMMENDATION & CATALOG MATCHING
  if (
    lower.includes("কোনটা ভালো") ||
    lower.includes("recommend") ||
    lower.includes("পণ্য") ||
    lower.includes("ঘড়ি") ||
    lower.includes("শাড়ি") ||
    lower.includes("headphone") ||
    lower.includes("smartwatch") ||
    lower.includes("watch") ||
    lower.includes("shoes") ||
    lower.includes("জুতা") ||
    lower.includes("কালার") ||
    lower.includes("সাইজ") ||
    lower.includes("stock") ||
    lower.includes("স্টক") ||
    lower.includes("দাম কত")
  ) {
    const featuredList = sampleProducts.length > 0
      ? sampleProducts.slice(0, 3).map((p) => `• ${p.name} (৳${p.price.toLocaleString()})`).join("\n")
      : "• Premium Smartwatch Pro (৳3,450)\n• True Wireless Noise-Cancelling Earbuds (৳1,890)\n• Fast-Charging 20,000mAh Powerbank (৳1,450)";

    return {
      detectedSentiment: "Curious Shopper / Ready to Purchase",
      urgencyLevel: "Medium",
      suggestedResponseBengali: `আপনার আগ্রহের জন্য ধন্যবাদ! 🌟 আমাদের স্টোরে এই ক্যাটাগরির বেশ কিছু শীর্ষ রেটেড বেস্টসেলার পণ্য রেডি স্টক রয়েছে:\n\n${featuredList}\n\nপ্রতিটি পণ্যে পাচ্ছেন অফিসিয়াল ওয়ারেন্টি, ঢাকা সিটিতে ২৪ ঘণ্টার মধ্যে ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা। আপনি কি নির্দিষ্ট কোনো মডেল, বাজেট বা কালার খুঁজছেন? জানালে আমি আপনাকে সঠিক পণ্যটি বাছাই করতে সাহায্য করতে পারি!`,
      suggestedResponseEnglish: `Thank you for your interest! 🌟 Here are some of our top-rated trending bestsellers currently in ready stock:\n\n${featuredList}\n\nAll items feature verified warranty and fast cash on delivery. Do you have a specific budget range or preference in mind? I'd be delighted to assist you in selecting the ideal option!`,
      negotiationTactic: "Curated Solution Selling with Gentle Consultative Closing",
      recommendedAction: "Provide direct product link and check inventory stock",
      objectionHandled: "Choice Overload & Product Selection Guidance",
      quickAction: {
        type: "product_link",
        value: "/products",
        label: "View All In-Stock Best Sellers",
      },
    };
  }

  // 7. ORDER CANCELLATION REQUEST
  if (
    lower.includes("cancel") ||
    lower.includes("বাতিল") ||
    lower.includes("ক্যান্সেল") ||
    lower.includes("নেব না") ||
    lower.includes("অর্ডার বাতিল")
  ) {
    return {
      detectedSentiment: "Buyer Remorse / Cancellation Request",
      urgencyLevel: "High",
      suggestedResponseBengali: `আপনার অর্ডার বাতিলের অনুরোধটি আমরা পেয়েছি। ⚠️ যদি আপনার পার্সেলটি এখনও কুরিয়ারে ডিসপ্যাচ না হয়ে থাকে, তবে আমাদের সিস্টেম থেকে কোনো ফি ছাড়াই সাথে সাথে বাতিল করা সম্ভব। আপনি কি কোনো নির্দিষ্ট কারণে (যেমন: সাইজ পরিবর্তন, কালার পছন্দ, বা ডেলিভারি ডেট পেছানো) অর্ডার বাতিল করতে চাইছেন? জানালে আমরা পার্সেলটি মডিফাই করে দিতে পারি। আর যদি চূড়ান্ত বাতিলই করতে চান, আপনার অর্ডার আইডিটি দিন—আমরা তৎক্ষণাৎ ক্যানসেল করে রিফান্ড প্রসেস সম্পন্ন করছি।`,
      suggestedResponseEnglish: `We have received your cancellation request. ⚠️ If your order has not yet been handed over to the courier, we can cancel it immediately without any fee. Is there a specific change you'd like (such as color, size, or alternate delivery time)? We can modify the parcel for you. If you still wish to proceed with cancellation, please share your order ID for immediate processing.`,
      negotiationTactic: "Constructive Retention Attempt followed by Frictionless Service",
      recommendedAction: "Check warehouse dispatch log; if not dispatched, process cancellation and SMS confirmation",
      objectionHandled: "Order Cancellation & Pre-Dispatch Retention",
    };
  }

  // 8. GENERAL GREETINGS & INTRODUCTORY
  return {
    detectedSentiment: "Polite Greeting / General Inquiry",
    urgencyLevel: "Low",
    suggestedResponseBengali: `আসসালামু আলাইকুম ${name}! 👋 স্মার্টশপে আপনাকে আন্তরিক স্বাগতম। আমি আপনার সার্বক্ষণিক এআই শপিং ও কাস্টমার কেয়ার অ্যাসিস্ট্যান্ট। পণ্য স্পেসিফিকেশন, অফার, কুপন কোড, অর্ডার ট্র্যাকিং কিংবা পেমেন্ট ও ডেলিভারি সংক্রান্ত যেকোনো তথ্যে আপনাকে কীভাবে সহায়তা করতে পারি বলুন?`,
    suggestedResponseEnglish: `Hello ${name}! 👋 Welcome to SmartShop. I am your 24/7 dedicated customer care and shopping assistant. How may I assist you today with product features, live deals, order tracking, or store policies?`,
    negotiationTactic: "Welcoming Omnichannel Service Readiness",
    recommendedAction: "Engage customer with relevant department assistance",
    objectionHandled: "Store Openness & Direct Support Accessibility",
    quickAction: {
      type: "coupon",
      value: "WELCOME5",
      label: "Use WELCOME5 for 5% Off",
    },
  };
}

// ---------------------------------------------------------------------------
// 2. DYNAMIC SERVICE DESK RESOLUTION GENERATOR
// ---------------------------------------------------------------------------
export function generateRealisticServiceResolution(params: ServiceResolutionParams): ServiceResolutionResult {
  const { ticketId, issueType, customerName, orderId, complaintDetails } = params;
  const lower = (complaintDetails + " " + issueType).toLowerCase();
  const effectiveOrderId = orderId && orderId !== "N/A" ? orderId : "ORD-" + Math.floor(1000 + Math.random() * 9000);

  // Category 1: Delivery Delay / Logistics Failure
  if (
    lower.includes("delay") ||
    lower.includes("late") ||
    lower.includes("দেরি") ||
    lower.includes("পৌঁছায়নি") ||
    lower.includes("shipping") ||
    lower.includes("কুরিয়ার") ||
    lower.includes("dispatch")
  ) {
    return {
      ticketId,
      empathyRating: "5/5 Star High-Urgency Protocol",
      resolutionStatus: "Action Required / Express Dispatch Flagged",
      officialReplyBengali: `প্রিয় ${customerName}, আপনার অর্ডারটি (#${effectiveOrderId}) পৌঁছাতে বিলম্ব হওয়ায় আমরা আন্তরিকভাবে ক্ষমাপ্রার্থী। 🙏 আমাদের সেন্ট্রাল লজিস্টিকস টিম আপনার পার্সেলটি ট্র্যাক করে দেখতে পেয়েছে যে এটি লোকাল কুরিয়ার হাব-এ ট্রানজিটে রয়েছে। আমরা ইতিমধ্যে সংশ্লিষ্ট কুরিয়ার ব্রাঞ্চ ম্যানেজারের সাথে যোগাযোগ করে পার্সেলটিকে 'High Priority VIP Dispatch' হিসেবে মার্ক করেছি। ইনশাআল্লাহ আগামী ২৪ ঘণ্টার মধ্যে রাইডার আপনার ঠিকানায় পার্সেলটি হ্যান্ডওভার করবেন। সাময়িক এই অসুবিধার সৌজন্য ক্ষতিপূরণ হিসেবে আপনার পরবর্তী কেনাকাটায় ৳১০০ ফ্ল্যাট ছাড় পেতে কুপন কোড 'CARE100' ব্যবহার করতে পারেন।`,
      officialReplyEnglish: `Dear ${customerName}, we sincerely apologize for the unexpected delay regarding order #${effectiveOrderId}. Our central logistics dispatch has expedited your parcel directly with the courier branch manager as a 'High Priority Dispatch'. The parcel will reach your address within the next 24 hours. As a token of our regret for this delay, please enjoy coupon code 'CARE100' for ৳100 off your next order. Thank you for your continued patience!`,
      policyCheck: "Store Delivery SLA Guarantee: Eligible for Expedited Dispatch & Courtesy Voucher",
      suggestedCompensation: "৳100 Courtesy Voucher (CARE100)",
      actionSteps: [
        "Flag ticket to High Priority and assign Steadfast/Pathao tracking coordinator",
        "Send customer automated SMS with live courier phone and tracking URL",
        "Perform satisfaction follow-up 2 hours after delivery confirmation",
      ],
    };
  }

  // Category 2: Defective / Damaged Item / RMA Return
  if (
    lower.includes("ভাঙা") ||
    lower.includes("damage") ||
    lower.includes("defective") ||
    lower.includes("নষ্ট") ||
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("রিটার্ন") ||
    lower.includes("বদল")
  ) {
    return {
      ticketId,
      empathyRating: "5/5 Exceptional De-escalation Protocol",
      resolutionStatus: "RMA Free Pickup Approved",
      officialReplyBengali: `প্রিয় ${customerName}, অর্ডার #${effectiveOrderId}-এর পণ্যটিতে ত্রুটির কথা জানতে পেরে আমরা অত্যন্ত লজ্জিত ও দুঃখিত। 🙏 আমাদের ৭ দিনের গ্যারান্টি পলিসি অনুযায়ী আমরা একটি সম্পূর্ণ ফ্রি ডোরস্টেপ পিকআপ শিডিউল করেছি। আপনার থেকে কোনো পিকআপ ফি নেওয়া হবে না। কুরিয়ার রাইডার আপনার থেকে ত্রুটিযুক্ত পার্সেলটি সংগ্রহ করার সাথে সাথেই আমাদের ওয়্যারহাউস থেকে সিল-ইনট্যাক্ট নতুন রিপ্লেসমেন্ট পাঠানো হবে অথবা আপনার বিকাশ/নগদে সম্পূর্ণ টাকা রিফান্ড করা হবে। আপনার অসুবিধার জন্য অতিরিক্ত ৳১৫০ মূল্যের একটি কুপন 'SORRY150' আপনার প্রোফাইলে যুক্ত করে দেওয়া হয়েছে।`,
      officialReplyEnglish: `Dear ${customerName}, we are deeply regretful that you received an imperfect product for order #${effectiveOrderId}. Under our 7-day store guarantee, we have approved a complimentary doorstep reverse pickup with 0 cost to you. As soon as the courier collects the defective unit, we will either dispatch a factory-sealed replacement or initiate a full refund to your bKash/Nagad wallet. In addition, coupon code 'SORRY150' has been credited to your account.`,
      policyCheck: "RMA 7-Day Hassle-Free Replacement Policy: 100% Approved",
      suggestedCompensation: "Zero-Cost Doorstep Pickup + ৳150 Voucher (SORRY150)",
      actionSteps: [
        "Issue reverse courier waybill with 0 pickup fee for Steadfast Rider",
        "Trigger replacement dispatch reservation in inventory system",
        "Notify customer service supervisor for priority RMA audit",
      ],
    };
  }

  // Category 3: Payment Mismatch / TrxID Inquiry
  if (
    lower.includes("payment") ||
    lower.includes("টাকা") ||
    lower.includes("বিকাশ") ||
    lower.includes("bkash") ||
    lower.includes("নগদ") ||
    lower.includes("nagad") ||
    lower.includes("trxid") ||
    lower.includes("failed")
  ) {
    return {
      ticketId,
      empathyRating: "4.8/5 Star Financial Security Protocol",
      resolutionStatus: "Gateway Reconciliation In Progress",
      officialReplyBengali: `প্রিয় ${customerName}, আপনার অর্ডার #${effectiveOrderId}-এর পেমেন্ট যাচাইকরণ সংক্রান্ত বার্তাটি আমরা গুরুত্বের সাথে নিয়েছি। 💳 আমাদের অ্যাকাউন্টস টিম পেমেন্ট গেটওয়েতে আপনার লেনদেনটি ম্যানুয়ালি মিলিয়ে দেখছে। যদি ব্যাংক বা বিকাশ ওয়ালেট থেকে অর্থ কেটে নেওয়া হয়ে থাকে তবে কোনো অবস্থাতেই তা বিনষ্ট হবে না—অর্ডারটি অবিলম্বে 'Paid & Confirmed' স্ট্যাটাসে আপডেট করা হবে। কোনো ডুপ্লিকেট লেনদেন হয়ে থাকলে ২৪ কর্মঘণ্টার মধ্যে স্বয়ংক্রিয়ভাবে মূল অ্যাকাউন্টে রিভার্স হয়ে যাবে।`,
      officialReplyEnglish: `Dear ${customerName}, thank you for alerting us regarding payment verification for order #${effectiveOrderId}. Our finance accounts department is reconciling the transaction record with our merchant payment gateway. If your wallet was debited, your order will be marked confirmed without delay. Any inadvertent duplicate debit is protected by auto-reversal within 24 business hours.`,
      policyCheck: "Fintech Consumer Protection Policy: Verified & Guaranteed",
      suggestedCompensation: "Free Shipping on Order or ৳50 Wallet Credit",
      actionSteps: [
        "Query MFS gateway settlement portal for transaction matching",
        "Update order status to 'Payment Verified' upon batch match",
        "Send confirmation SMS with updated invoice to customer",
      ],
    };
  }

  // Default Professional Service Desk Resolution
  return {
    ticketId,
    empathyRating: "5/5 Star Standard Resolution Protocol",
    resolutionStatus: "Under Active Investigation / Senior Escalation",
    officialReplyBengali: `প্রিয় ${customerName}, টিকিট #${ticketId} (অর্ডার #${effectiveOrderId}) এর মাধ্যমে আমাদের অবগত করার জন্য ধন্যবাদ। আমাদের কাস্টমার সার্ভিস ম্যানেজমেন্ট আপনার অভিযোগটি অত্যন্ত গুরুত্বের সাথে পর্যালোচনা করছে। আমাদের ডেডিকেটেড সাপোর্ট অফিসার আপনার কেসটি মনিটর করছেন এবং পরবর্তী ৪ কর্মঘণ্টার মধ্যে একটি চূড়ান্ত সন্তোষজনক সমাধান নিশ্চিত করা হবে। আপনার নিরবচ্ছিন্ন আস্থার জন্য আমরা আন্তরিকভাবে কৃতজ্ঞ।`,
    officialReplyEnglish: `Dear ${customerName}, thank you for logging ticket #${ticketId} regarding order #${effectiveOrderId}. Our customer service executive team is actively investigating your request. A senior support specialist has been assigned to provide you with a satisfactory solution within 4 business hours. We appreciate your valuable patience and trust.`,
    policyCheck: "Standard Customer Support SLA: 4-Hour Response Protocol Active",
    suggestedCompensation: "৳50 Courtesy Voucher (CARE50)",
    actionSteps: [
      "Assign ticket to Tier-2 senior customer service officer",
      "Set internal resolution timer for 4-hour SLA guarantee",
      "Document case notes in customer CRM profile",
    ],
  };
}

// ---------------------------------------------------------------------------
// 3. DYNAMIC ADMIN CHAT (SmartOmni Copilot) REPLY GENERATOR
// ---------------------------------------------------------------------------
export function generateRealisticAdminChatReply(params: AdminChatParams): string {
  const { message, storeContext } = params;
  const lower = message.toLowerCase();
  const productsCount = storeContext?.productsCount || 12;
  const ordersCount = storeContext?.ordersCount || 8;
  const totalRevenue = storeContext?.totalRevenue || 45200;

  // Question about Marketing / Ads
  if (lower.includes("marketing") || lower.includes("মার্কেটিং") || lower.includes("অ্যাড") || lower.includes("campaign") || lower.includes("বিজ্ঞাপন") || lower.includes("ফেসবুক")) {
    return `আসসালামু আলাইকুম! আপনার স্টোরের মার্কেটিং পারফরম্যান্স ও ক্যাম্পেইন বৃদ্ধির জন্য আমার বিশ্লেষণ:\n\n` +
      `📊 **বর্তমান স্টোর স্ট্যাটাস:** ${productsCount}টি অ্যাক্টিভ প্রোডাক্ট ও মোট রেভিনিউ ৳${totalRevenue.toLocaleString()}।\n` +
      `🔥 **উচ্চ-কনভার্সন সুপারিশ:**\n` +
      `1. **উইকএন্ড ফ্ল্যাশ সেল (Weekend Flash Sale):** আপনার ট্রেন্ডিং প্রোডাক্টের ওপর ১৫% ফ্ল্যাট ছাড় দিয়ে Facebook ক্যারোসেল ও রিলস অ্যাড রান করুন।\n` +
      `2. **টার্গেটেড অডিয়েন্স (BD):** ১৮-৩৪ বছর বয়সী ঢাকা, চট্টগ্রাম ও সিলেটের অনলাইন ক্রেতাদের টার্গেট করুন যারা প্রিমিয়াম লাইফস্টাইল ও গ্যাজেট কেনাকাটায় আগ্রহী।\n` +
      `3. **এসএমএস ব্রডকাস্ট:** যারা গত ৭ দিনে কার্টে প্রোডাক্ট রেখেছিলেন তাদের 'FLASH15' কোড দিয়ে রাত ৮টার পিক টাইমে এসএমএস পাঠান।\n` +
      `💡 আপনার এআই মার্কেটিং ক্যাম্পেইন জেনারেট করতে উপরের **'Marketing'** ট্যাবে ক্লিক করে সরাসরি অ্যাড কপি ও আরওএএস (ROAS) প্রজেকশন তৈরি করতে পারেন!`;
  }

  // Question about Sales / Abandoned Cart / Conversion
  if (lower.includes("sales") || lower.includes("বিক্রি") || lower.includes("সেলস") || lower.includes("কার্ট") || lower.includes("drop") || lower.includes("cart") || lower.includes("conversion")) {
    return `সেলস অপ্টিমাইজেশন ও কার্ট ড্রপ-অফ রিকভারির জন্য আমার সুপারিশ:\n\n` +
      `📈 **স্টোর অ্যানালিটিক্স:** মোট ${ordersCount}টি অর্ডারে গড় অর্ডার ভ্যালু (AOV) প্রায় ৳${Math.round(totalRevenue / Math.max(ordersCount, 1)).toLocaleString()}।\n` +
      `🎯 **অ্যাকশন প্ল্যান:**\n` +
      `1. **অটোমেটেড কার্ট রিকভারি:** চেকআউটে এসে ফিরে যাওয়া গ্রাহকদের ২৪ ঘণ্টার মধ্যে 'RECOVER10' কুপন সহ অটো-এসএমএস দিন। এতে ১৫-২০% ড্রপ-অফ পুনরুদ্ধার সম্ভব।\n` +
      `2. **ফ্রি শিপিং থ্রেশহোল্ড:** ৳১,৫০০ বা তার বেশি কেনাকাটায় ফ্রি ডেলিভারি চালু করলে কাস্টমাররা অতিরিক্ত পণ্য কার্টে যোগ করতে উৎসাহিত হয়।\n` +
      `3. **আর্জেন্ট স্টক ব্যাজ:** যেসব পণ্যের স্টক কম সেখানে 'Only few left!' ব্যাজ সক্রিয় রাখুন।\n` +
      `👉 বিশদ অ্যানালিটিক্স ও কার্ট অডিট দেখতে **'Sales'** এবং **'Daily Hesitant'** ট্যাব দেখুন!`;
  }

  // Question about Customer Handling / Price Objection / Negotiation
  if (lower.includes("customer") || lower.includes("কাস্টমার") || lower.includes("দাম") || lower.includes("আপত্তি") || lower.includes("নেগোসিয়েশন") || lower.includes("objection")) {
    return `কাস্টমার হ্যান্ডলিং ও দামের আপত্তি নিরসনে আমাদের প্রমাণিত কৌশল:\n\n` +
      `🤝 **মূল্যের চেয়ে গুণমানের গুরুত্ব:** কোনো গ্রাহক "অন্য দোকানে কম দাম" বললে সরাসরি দাম না কমিয়ে আমাদের ১০০% অফিশিয়াল অথেন্টিসিটি, ৭ দিনের ফ্রি রিটার্ন ও ক্যাশ অন ডেলিভারি সুবিধার কথা তুলে ধরুন।\n` +
      `🎁 **ক্লোজিং ইনসেন্টিভ:** ৫% ওয়েলকাম কুপন 'WELCOME5' বা ফ্রি শিপিং অফার করে অবিলম্বে অর্ডার কনফার্ম করতে অনুপ্রাণিত করুন।\n` +
      `⚡ **দ্রুত রেসপন্স টাইম:** মেসেঞ্জারে ৩ মিনিটের মধ্যে উত্তর দিলে কনভার্সন রেট ৪ গুণ বৃদ্ধি পায়।\n` +
      `👉 নির্দিষ্ট কাস্টমার বার্তার জন্য এআই রিপ্লাই বানাতে **'Customer Handler'** ট্যাব ব্যবহার করুন!`;
  }

  // Question about Courier / Delivery / Logistics
  if (lower.includes("courier") || lower.includes("কুরিয়ার") || lower.includes("ডেলিভারি") || lower.includes("পাঠাও") || lower.includes("steadfast") || lower.includes("শিপিং")) {
    return `লজিস্টিকস ও কুরিয়ার পার্টনারশিপ ম্যানেজমেন্ট গাইড:\n\n` +
      `🚚 **কুরিয়ার বাছাই:**\n` +
      `• **ঢাকা সিটির ভেতরে:** Pathao বা Paperfly এক্সপ্রেস (২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন, চার্জ ৳৬০)।\n` +
      `• **ঢাকার বাইরে ও জেলা পর্যায়ে:** Steadfast Courier (রিটার্ন রেট সর্বনিম্ন ও সারাদেশে ২-৪ দিনে ক্যাশ কালেকশন, চার্জ ৳১২০)।\n` +
      `📦 **অর্ডার হ্যান্ডওভার সময়:** প্রতিদিন বিকাল ৪:৩০-এর মধ্যে পার্সেল কুরিয়ার রাইডারের কাছে হস্তান্তর করলে পরবর্তী দিন সকালে ডেলিভারি নিশ্চিত হয়।\n` +
      `👉 বর্তমান অর্ডারের কুরিয়ার প্রস্তুতি দেখতে **'Ordered Customers'** ট্যাবে ক্লিক করুন!`;
  }

  // Question about Lead Generation / B2B Wholesale
  if (lower.includes("lead") || lower.includes("লিড") || lower.includes("b2b") || lower.includes("পাইকারি") || lower.includes("corporate")) {
    return `বিটুবি ও বাল্ক বায়ার লিড জেনারেশন স্ট্র্যাটেজি:\n\n` +
      `💼 **টার্গেট সেগমেন্ট:** কর্পোরেট অফিস, উৎসব উপহার গিফট কিট এবং ঢাকা/চট্টগ্রামের খুচরা রিসেলার।\n` +
      `📋 **অফার কাঠামো:** ২৫+ পিসের অর্ডারে ১৫-২৫% পাইকারি মূল্যছাড় ও ফ্রি ডোরস্টেপ ডেলিভারি।\n` +
      `📞 **আউটরিচ মেথড:** লিড পাওয়ার ২ ঘণ্টার মধ্যে হোয়াটসঅ্যাপে পার্সোনালাইজড প্রাইস কোটেশন ও ক্যাটালগ পাঠানো।\n` +
      `👉 নতুন ভেরিফায়েড লিড জেনারেট করতে **'Lead Gen'** ট্যাবে প্রবেশ করুন!`;
  }

  // Default Comprehensive Strategic Response
  return `আসসালামু আলাইকুম! আমি আপনার **SmartOmni AI Master Business Copilot**। 🤖\n\n` +
    `আপনার স্টোরের সার্বিক তত্ত্বাবধানে আমি সক্রিয় রয়েছি।\n` +
    `• 📦 **পণ্য ক্যাটালগ:** ${productsCount}টি আইটেম রিয়েল-টাইম সিঙ্কড\n` +
    `• 💰 **বর্তমান রেভিনিউ:** ৳${totalRevenue.toLocaleString()}\n` +
    `• ⚡ **সক্রিয় মডিউলসমূহ:** Marketing, Lead Gen, Sales Oversight, Customer Handling, Service Desk & Order Intelligence\n\n` +
    `আপনি আমাকে যেকোনো মার্কেটিং ক্যাম্পেইন আইডিয়া, সেলস বৃদ্ধির উপায়, কাস্টমার মেসেজের উত্তর বা কুরিয়ার সংক্রান্ত প্রশ্ন করতে পারেন।`;
}
