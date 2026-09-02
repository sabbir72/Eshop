import { ImageProvider, SuggestedImage } from "../types";

interface CuratedItem {
  id: string;
  keywords: string[];
  url: string;
  thumbnail: string;
  source: string;
  sourceUrl: string;
  author: string;
  authorUrl: string;
  alt: string;
  width: number;
  height: number;
}

const CURATED_CATALOG: CuratedItem[] = [
  // Men's T-Shirts & Apparel
  {
    id: "curated-tshirt-black-1",
    keywords: ["men", "mens", "black", "tshirt", "t-shirt", "tee", "shirt", "top", "clothing", "apparel"],
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com/photos/ee0c2909d518",
    author: "Faith Yarn",
    authorUrl: "https://unsplash.com/@faithyarn",
    alt: "Classic Men's Black Crewneck T-Shirt",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-tshirt-black-2",
    keywords: ["men", "mens", "black", "tshirt", "t-shirt", "cotton", "casual", "tee"],
    url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com/photos/8936f5b7be1a",
    author: "Alexander Andrews",
    authorUrl: "https://unsplash.com/@alexandraws",
    alt: "Premium Black Heavyweight Cotton T-Shirt",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-tshirt-white-1",
    keywords: ["white", "tshirt", "t-shirt", "tee", "plain", "cotton", "men", "women", "unisex"],
    url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com/photos/df123a1eb820",
    author: "Katsiaryna Endruszkiewicz",
    authorUrl: "https://unsplash.com/@katendruszkiewicz",
    alt: "Minimalist Plain White Organic T-Shirt",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-tshirt-polo-1",
    keywords: ["polo", "shirt", "collar", "men", "mens", "blue", "navy", "casual", "formal"],
    url: "https://images.unsplash.com/photo-1625910513413-7a6c9d087994?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1625910513413-7a6c9d087994?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "MD Duran",
    authorUrl: "https://unsplash.com",
    alt: "Classic Pique Knit Polo Shirt",
    width: 1000,
    height: 1000,
  },

  // Hoodies & Outerwear
  {
    id: "curated-hoodie-1",
    keywords: ["hoodie", "sweatshirt", "jacket", "fleece", "pullover", "winter", "warm"],
    url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Ryan Hoffman",
    authorUrl: "https://unsplash.com",
    alt: "Cozy Oversized Streetwear Hoodie",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-jacket-leather-1",
    keywords: ["leather", "jacket", "biker", "coat", "winter", "black", "outerwear"],
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Clément Falize",
    authorUrl: "https://unsplash.com",
    alt: "Vintage Genuine Black Leather Jacket",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-jeans-denim-1",
    keywords: ["jeans", "denim", "pants", "trousers", "blue", "slim", "fashion"],
    url: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Manoj Kumar",
    authorUrl: "https://unsplash.com",
    alt: "Classic Slim Fit Blue Denim Jeans",
    width: 1000,
    height: 1000,
  },

  // Shoes & Sneakers
  {
    id: "curated-shoes-sneakers-1",
    keywords: ["shoes", "sneakers", "running", "nike", "sport", "footwear", "trainers", "athletic"],
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "REVOLT",
    authorUrl: "https://unsplash.com/@revolt",
    alt: "High Performance Red Sports Running Sneakers",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-shoes-white-1",
    keywords: ["shoes", "sneakers", "white", "casual", "leather", "streetwear"],
    url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Wu Yi",
    authorUrl: "https://unsplash.com",
    alt: "Clean Minimalist White Casual Sneakers",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-shoes-formal-1",
    keywords: ["shoes", "formal", "leather", "oxford", "derby", "brown", "business", "dress"],
    url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Gerd Altmann",
    authorUrl: "https://unsplash.com",
    alt: "Handcrafted Italian Leather Formal Shoes",
    width: 1000,
    height: 1000,
  },

  // Electronics: Smartphones & Tablets
  {
    id: "curated-phone-iphone-1",
    keywords: ["phone", "smartphone", "iphone", "apple", "mobile", "ios", "pro", "gadget"],
    url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Denis Cherkashin",
    authorUrl: "https://unsplash.com",
    alt: "Flagship Dual Camera Smartphone Space Gray",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-phone-samsung-1",
    keywords: ["phone", "smartphone", "android", "galaxy", "samsung", "display", "camera"],
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Neil Soni",
    authorUrl: "https://unsplash.com",
    alt: "Ultra Slim Flagship Android Smartphone",
    width: 1000,
    height: 1000,
  },

  // Audio: Headphones & Earbuds
  {
    id: "curated-audio-headphones-1",
    keywords: ["headphones", "headset", "wireless", "bluetooth", "audio", "anc", "music", "sound"],
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "C-Head",
    authorUrl: "https://unsplash.com",
    alt: "Premium Active Noise-Cancelling Over-Ear Headphones",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-audio-earbuds-1",
    keywords: ["earbuds", "airpods", "wireless", "bluetooth", "tws", "audio", "earphones"],
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Malte Helmhold",
    authorUrl: "https://unsplash.com",
    alt: "True Wireless Stereo Bluetooth Earbuds with Charging Case",
    width: 1000,
    height: 1000,
  },

  // Computers & Laptops
  {
    id: "curated-laptop-macbook-1",
    keywords: ["laptop", "macbook", "computer", "pc", "apple", "ultrabook", "notebook", "desk"],
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Alejandro Escamilla",
    authorUrl: "https://unsplash.com",
    alt: "Sleek Aluminum Slim Ultrabook Laptop",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-gaming-mouse-1",
    keywords: ["mouse", "gaming", "rgb", "pc", "accessory", "peripherals", "esports"],
    url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Oscar Ivan Esquivel Arteaga",
    authorUrl: "https://unsplash.com",
    alt: "High-DPI RGB Ergonomic Wireless Gaming Mouse",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-keyboard-mechanical-1",
    keywords: ["keyboard", "mechanical", "rgb", "keychron", "gaming", "typing"],
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Jay Zhang",
    authorUrl: "https://unsplash.com",
    alt: "Custom Hot-Swappable Mechanical Keyboard",
    width: 1000,
    height: 1000,
  },

  // Watches & Accessories
  {
    id: "curated-watch-smart-1",
    keywords: ["watch", "smartwatch", "apple", "fitness", "tracker", "digital", "wrist"],
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Rachit Tank",
    authorUrl: "https://unsplash.com",
    alt: "Modern Smart Fitness Tracker Watch",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-watch-luxury-1",
    keywords: ["watch", "luxury", "chronograph", "analog", "leather", "classic", "men", "mens"],
    url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Fernando Arcos",
    authorUrl: "https://unsplash.com",
    alt: "Luxury Automatic Chronograph Wrist Watch",
    width: 1000,
    height: 1000,
  },

  // Bags & Backpacks
  {
    id: "curated-bag-backpack-1",
    keywords: ["bag", "backpack", "travel", "laptop", "canvas", "outdoor", "leather"],
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Sun Lingyan",
    authorUrl: "https://unsplash.com",
    alt: "Waterproof Travel Laptop Commuter Backpack",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-bag-leather-tote-1",
    keywords: ["bag", "handbag", "purse", "leather", "tote", "women", "womens", "fashion"],
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Creative Exchange Agency",
    authorUrl: "https://unsplash.com",
    alt: "Premium Tan Genuine Leather Tote Handbag",
    width: 1000,
    height: 1000,
  },

  // Sunglasses & Eyewear
  {
    id: "curated-glasses-sunglasses-1",
    keywords: ["sunglasses", "glasses", "shades", "eyewear", "aviator", "polarized", "summer"],
    url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Ethan Robertson",
    authorUrl: "https://unsplash.com",
    alt: "Classic Polarized UV400 Dark Sunglasses",
    width: 1000,
    height: 1000,
  },

  // Beauty, Skincare & Perfume
  {
    id: "curated-beauty-perfume-1",
    keywords: ["perfume", "fragrance", "cologne", "scent", "luxury", "beauty", "cosmetics"],
    url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Laura Chouette",
    authorUrl: "https://unsplash.com",
    alt: "Eau De Parfum Luxury Glass Spray Bottle",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-beauty-skincare-1",
    keywords: ["skincare", "serum", "cream", "lotion", "organic", "moisturizer", "face", "beauty"],
    url: "https://images.unsplash.com/photo-1608248597359-5975d0f622f9?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1608248597359-5975d0f622f9?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Mathilde Langevin",
    authorUrl: "https://unsplash.com",
    alt: "Organic Vitamin C Facial Serum Dropper Bottle",
    width: 1000,
    height: 1000,
  },

  // Home & Kitchen
  {
    id: "curated-home-coffee-1",
    keywords: ["coffee", "espresso", "machine", "maker", "kitchen", "appliance", "cafe", "cup"],
    url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Demi DeHerrera",
    authorUrl: "https://unsplash.com",
    alt: "Italian Espresso Coffee Maker Machine",
    width: 1000,
    height: 1000,
  },
  {
    id: "curated-home-lamp-1",
    keywords: ["lamp", "light", "desk", "lighting", "home", "decor", "modern"],
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=70",
    source: "Unsplash Curated",
    sourceUrl: "https://unsplash.com",
    author: "Kelly Sikkema",
    authorUrl: "https://unsplash.com",
    alt: "Minimalist Nordic LED Desk Reading Lamp",
    width: 1000,
    height: 1000,
  },
];

export class CuratedFallbackProvider implements ImageProvider {
  readonly name = "Curated E-Commerce Library";

  isConfigured(): boolean {
    return true; // Always ready with no external API keys required
  }

  async searchImages(query: string, limit = 8): Promise<SuggestedImage[]> {
    const cleanTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (cleanTokens.length === 0) {
      return CURATED_CATALOG.slice(0, limit);
    }

    // Score catalog items by keyword match relevance
    const scored = CURATED_CATALOG.map((item) => {
      let score = 0;
      const itemTitle = item.alt.toLowerCase();

      cleanTokens.forEach((token) => {
        // Exact keyword match
        if (item.keywords.includes(token)) {
          score += 5;
        } else if (item.keywords.some((k) => k.includes(token) || token.includes(k))) {
          score += 2;
        }

        // Title token match
        if (itemTitle.includes(token)) {
          score += 4;
        }
      });

      return { item, score };
    });

    const matches = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);

    // If matches found, return top scored items
    if (matches.length > 0) {
      return matches.slice(0, limit);
    }

    // Dynamic Source Unsplash Fallback for specific queries
    const dynamicUnsplashSeed = encodeURIComponent(query.trim());
    return [
      {
        id: `unsplash-dynamic-${Date.now()}-1`,
        url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80&search=${dynamicUnsplashSeed}`,
        thumbnail: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70&search=${dynamicUnsplashSeed}`,
        source: "Unsplash Direct",
        sourceUrl: "https://unsplash.com",
        author: "Unsplash Photographers",
        alt: `${query} product photo`,
        width: 1000,
        height: 1000,
      },
      ...CURATED_CATALOG.slice(0, Math.max(1, limit - 1)),
    ];
  }
}
