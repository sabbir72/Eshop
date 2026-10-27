import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStore } from "../../context/StoreContext";
import { Product } from "../../types";
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
  ShoppingBag,
  ArrowRight,
  Eye,
  Sliders,
  Layers,
  Flame,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface ThreeDProductStageProps {
  onQuickView?: (product: Product) => void;
}

export const ThreeDProductStage: React.FC<ThreeDProductStageProps> = ({
  onQuickView,
}) => {
  const { products, addToCart, addToast, setStoreView, setSelectedProduct } = useStore();

  const productList = products || [];
  // Curated list of flagship products for 3D showcase
  const flagshipProducts = productList.filter((p) =>
    p?.name && (
      p.name.includes("iPhone 15 Pro") ||
      p.name.includes("MacBook") ||
      p.name.includes("Sony WH") ||
      p.name.includes("Watch") ||
      p.name.includes("AirPods")
    )
  );
  const displayProducts = flagshipProducts.length >= 3 ? flagshipProducts : productList.slice(0, 4);

  const [activeProductIdx, setActiveProductIdx] = useState(0);
  const currentProduct = displayProducts[activeProductIdx] || productList[0] || null;

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // 3D Controls State
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [lightingPreset, setLightingPreset] = useState<"cyber" | "studio" | "luxury">("cyber");
  const [activeColorway, setActiveColorway] = useState<string>("titanium");
  const [activeHotspot, setActiveHotspot] = useState<string | null>("camera");
  const [isWireframe, setIsWireframe] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Colorway definitions
  const colorways = [
    { id: "titanium", name: "Natural Titanium", hex: 0x8a857b, bg: "bg-[#8a857b]" },
    { id: "blue", name: "Blue Titanium", hex: 0x2e3b4e, bg: "bg-[#2e3b4e]" },
    { id: "white", name: "White Titanium", hex: 0xd8d8d8, bg: "bg-[#d8d8d8]" },
    { id: "black", name: "Black Titanium", hex: 0x1f2022, bg: "bg-[#1f2022]" },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !currentProduct) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    // 3. WebGL Renderer with safe try/catch
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default",
      });
    } catch (e) {
      console.warn("[ThreeDProductStage] WebGL not available or context blocked:", e);
      setWebGlSupported(false);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 3, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Adjust lighting based on preset
    if (lightingPreset === "cyber") {
      fillLight.color.setHex(0x06b6d4);
      rimLight.color.setHex(0xd946ef);
      keyLight.intensity = 2.2;
    } else if (lightingPreset === "luxury") {
      fillLight.color.setHex(0xf59e0b);
      rimLight.color.setHex(0xfbbf24);
      keyLight.intensity = 2.0;
    } else {
      fillLight.color.setHex(0xffffff);
      rimLight.color.setHex(0xffffff);
      keyLight.intensity = 3.0;
    }

    // 5. Holographic Pedestal & Ambient Rings
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Circular base disc
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.12, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.85,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.2;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing neon ring on pedestal edge
    const ringGeo = new THREE.TorusGeometry(1.62, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: lightingPreset === "cyber" ? 0x06b6d4 : lightingPreset === "luxury" ? 0xf59e0b : 0x6366f1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.14;
    pedestalGroup.add(ringMesh);

    // 6. Detailed 3D Procedural Composite Product Model
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    const currentColor = colorways.find((c) => c.id === activeColorway)?.hex || 0x8a857b;

    // Build Product Geometry based on type
    const isLaptop = currentProduct?.name.toLowerCase().includes("macbook") || currentProduct?.name.toLowerCase().includes("laptop");
    const isHeadphones = currentProduct?.name.toLowerCase().includes("headphone") || currentProduct?.name.toLowerCase().includes("wh-");

    if (isLaptop) {
      // LAPTOP BASE
      const baseLaptopGeo = new THREE.BoxGeometry(2.2, 0.08, 1.5);
      const laptopMat = new THREE.MeshStandardMaterial({
        color: currentColor,
        metalness: 0.9,
        roughness: 0.2,
        wireframe: isWireframe,
      });
      const baseLaptop = new THREE.Mesh(baseLaptopGeo, laptopMat);
      baseLaptop.position.y = -0.5;
      baseLaptop.castShadow = true;
      modelGroup.add(baseLaptop);

      // LAPTOP SCREEN (Tilted)
      const screenLidGeo = new THREE.BoxGeometry(2.2, 1.4, 0.05);
      const screenLid = new THREE.Mesh(screenLidGeo, laptopMat);
      screenLid.position.set(0, 0.2, -0.75);
      screenLid.rotation.x = -Math.PI / 12;
      modelGroup.add(screenLid);

      // SCREEN DISPLAY INNER GLASS
      const displayGeo = new THREE.PlaneGeometry(2.05, 1.25);
      const displayMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const displayMesh = new THREE.Mesh(displayGeo, displayMat);
      displayMesh.position.set(0, 0.2, -0.72);
      displayMesh.rotation.x = -Math.PI / 12;
      modelGroup.add(displayMesh);
    } else if (isHeadphones) {
      // HEADPHONES HEADBAND
      const bandGeo = new THREE.TorusGeometry(0.9, 0.08, 16, 48, Math.PI);
      const bandMat = new THREE.MeshStandardMaterial({
        color: currentColor,
        metalness: 0.8,
        roughness: 0.3,
        wireframe: isWireframe,
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      bandMesh.position.y = 0.2;
      modelGroup.add(bandMesh);

      // EAR CUPS
      const cupGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.4,
        roughness: 0.6,
      });
      const leftCup = new THREE.Mesh(cupGeo, cupMat);
      leftCup.position.set(-0.9, -0.1, 0);
      leftCup.rotation.z = Math.PI / 2;
      modelGroup.add(leftCup);

      const rightCup = new THREE.Mesh(cupGeo, cupMat);
      rightCup.position.set(0.9, -0.1, 0);
      rightCup.rotation.z = Math.PI / 2;
      modelGroup.add(rightCup);
    } else {
      // FLAGSHIP SMARTPHONE (e.g. iPhone 15 Pro Titanium)
      // 1. Titanium Chassis
      const phoneGeo = new THREE.BoxGeometry(1.2, 2.4, 0.12);
      const phoneMat = new THREE.MeshStandardMaterial({
        color: currentColor,
        metalness: 0.95,
        roughness: 0.18,
        wireframe: isWireframe,
      });
      const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
      phoneMesh.castShadow = true;
      modelGroup.add(phoneMesh);

      // 2. Ceramic Shield Front Glass Screen
      const screenGeo = new THREE.PlaneGeometry(1.14, 2.34);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x050816,
        metalness: 0.1,
        roughness: 0.05,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.z = 0.062;
      modelGroup.add(screenMesh);

      // Dynamic Island Pill
      const pillGeo = new THREE.CapsuleGeometry(0.04, 0.14, 8, 16);
      const pillMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const pillMesh = new THREE.Mesh(pillGeo, pillMat);
      pillMesh.rotation.z = Math.PI / 2;
      pillMesh.position.set(0, 0.98, 0.065);
      modelGroup.add(pillMesh);

      // 3. Back Camera Island
      const camIslandGeo = new THREE.BoxGeometry(0.52, 0.52, 0.06);
      const camIsland = new THREE.Mesh(camIslandGeo, phoneMat);
      camIsland.position.set(-0.28, 0.85, -0.08);
      modelGroup.add(camIsland);

      // 3 Triple Camera Lenses
      const lensGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 32);
      const lensRingMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1 });
      const lensGlassMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

      const l1 = new THREE.Mesh(lensGeo, lensRingMat);
      l1.rotation.x = Math.PI / 2;
      l1.position.set(-0.38, 0.96, -0.12);
      modelGroup.add(l1);

      const l2 = new THREE.Mesh(lensGeo, lensRingMat);
      l2.rotation.x = Math.PI / 2;
      l2.position.set(-0.38, 0.74, -0.12);
      modelGroup.add(l2);

      const l3 = new THREE.Mesh(lensGeo, lensRingMat);
      l3.rotation.x = Math.PI / 2;
      l3.position.set(-0.18, 0.85, -0.12);
      modelGroup.add(l3);
    }

    // 7. Ambient Particle Dust Cloud
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: lightingPreset === "cyber" ? 0x38bdf8 : lightingPreset === "luxury" ? 0xfbbf24 : 0x818cf8,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Mouse Drag / Touch Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !modelGroup) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x += deltaY * 0.008;

      // Clamp X rotation to avoid flipping upside down
      modelGroup.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, modelGroup.rotation.x));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    container.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Gentle floating animation
      const elapsedTime = clock.getElapsedTime();
      if (modelGroup) {
        modelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

        // Auto-spin turntable
        if (isAutoRotating && !isDragging) {
          modelGroup.rotation.y += 0.8 * delta;
        }
      }

      // Rotate subtle neon rings and particles
      ringMesh.rotation.z += 0.4 * delta;
      particles.rotation.y += 0.05 * delta;

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 420;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup resources to prevent WebGL memory leaks
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      renderer.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container && renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentProduct, activeColorway, lightingPreset, isAutoRotating, isWireframe]);

  if (!currentProduct) {
    return null;
  }

  const price = currentProduct?.discountPrice || currentProduct?.sellingPrice || 139990;
  const regularPrice = currentProduct?.sellingPrice || 150000;
  const hasDiscount = Boolean(
    currentProduct?.discountPrice &&
    currentProduct?.sellingPrice &&
    currentProduct.discountPrice < currentProduct.sellingPrice
  );

  return (
    <section className="relative w-full my-6 text-left">
      {/* Outer 3D Studio Stage Container */}
      <div className="bg-gradient-to-b from-[#070a18] via-[#0b102b] to-[#070a18] rounded-3xl border border-indigo-900/60 shadow-2xl p-5 sm:p-7 relative overflow-hidden">
        {/* Glow backdrop aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BAR: Header & Product Carousel Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/40 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                ৩ডি স্পেশাল স্টুডিও · Interactive 360°
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                WebGL Powered
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ৩৬০° ইন্টারেক্টিভ থ্রিডি এক্সপেরিয়েন্স জোন
            </h2>
          </div>

          {/* Product selector buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {displayProducts.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProductIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  idx === activeProductIdx
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>{p.name.split(" ")[0]} {p.name.split(" ")[1] || ""}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D CANVAS & INTERACTIVE HUD STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-3 relative z-10">
          {/* LEFT: 3D Canvas Area (7 Cols) */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] rounded-2xl bg-gradient-to-b from-slate-950/60 to-[#070b1e]/90 border border-indigo-950/80 overflow-hidden shadow-inner group">
            {/* Interactive Three.js WebGL Mount or CSS 3D Fallback */}
            {webGlSupported ? (
              <div
                ref={mountRef}
                className="w-full h-full min-h-[380px] sm:min-h-[440px] cursor-grab active:cursor-grabbing flex items-center justify-center"
                title="মাউস দিয়ে টেনে ৩৬০ ডিগ্রিতে ঘুরিয়ে দেখুন (Click and drag to spin 3D model)"
              />
            ) : (
              <div className="w-full h-full min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center p-6 relative select-none">
                <div
                  className="relative w-64 h-64 flex items-center justify-center transition-transform duration-300"
                  style={{
                    perspective: "1000px",
                    transform: `rotateY(${isAutoRotating ? 15 : 0}deg)`,
                  }}
                >
                  <img
                    src={currentProduct.mainImage}
                    alt={currentProduct.name}
                    className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                  />
                  {/* Glowing 3D Pedestal Ring */}
                  <div className="absolute -bottom-6 w-52 h-10 rounded-full border border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse" />
                </div>
                <div className="mt-4 px-3 py-1 bg-slate-900/90 text-cyan-300 text-xs rounded-full border border-cyan-500/30 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>হাই-রেজোলিউশন ৩ডি প্রজেকশন মোড</span>
                </div>
              </div>
            )}

            {/* Instruction Overlay Pill */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-indigo-500/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md pointer-events-none">
              <RotateCcw className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>মাউস দিয়ে ড্র্যাগ করে ৩৬০° ঘুরিয়ে দেখুন</span>
            </div>

            {/* Live Hotspots Pins Overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setActiveHotspot(activeHotspot === "camera" ? null : "camera")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                  activeHotspot === "camera"
                    ? "bg-cyan-500 text-slate-950 border-cyan-400"
                    : "bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                ◉ ক্যামেরা লেন্স
              </button>
              <button
                type="button"
                onClick={() => setActiveHotspot(activeHotspot === "titanium" ? null : "titanium")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                  activeHotspot === "titanium"
                    ? "bg-amber-400 text-slate-950 border-amber-300"
                    : "bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                ◉ টাইটানিয়াম ফ্রেম
              </button>
              <button
                type="button"
                onClick={() => setActiveHotspot(activeHotspot === "chip" ? null : "chip")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                  activeHotspot === "chip"
                    ? "bg-purple-500 text-white border-purple-400"
                    : "bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                ◉ প্রো প্রসেসর
              </button>
            </div>

            {/* Hotspot details tooltip */}
            {activeHotspot && (
              <div className="absolute bottom-12 left-3 max-w-xs bg-slate-950/95 border border-indigo-500/50 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs text-white space-y-1 animate-in fade-in">
                {activeHotspot === "camera" && (
                  <>
                    <strong className="text-cyan-400 text-[11px] block">৪৮ মেগাপিক্সেল ট্রিপল লেন্স সিস্টেম</strong>
                    <p className="text-[10px] text-slate-300">৫x অপটিক্যাল পেরিস্কোপ জুম ও নাইট মোড আল্ট্রা স্টেবিলাইজেশন।</p>
                  </>
                )}
                {activeHotspot === "titanium" && (
                  <>
                    <strong className="text-amber-400 text-[11px] block">গ্রেড ৫ অ্যারোস্পেস টাইটানিয়াম</strong>
                    <p className="text-[10px] text-slate-300">অবিশ্বাস্য হালকা অথচ মজবুত প্রিমিয়াম ব্রাশড মেটালিক ফিনিশ।</p>
                  </>
                )}
                {activeHotspot === "chip" && (
                  <>
                    <strong className="text-purple-400 text-[11px] block">A17 Pro ৩ ন্যানোমিটার চিপসেট</strong>
                    <p className="text-[10px] text-slate-300">কনসোল লেভেল রে-ট্রেসিং গেমিং ও হাই-স্পিড এআই নিউরাল ইঞ্জিন।</p>
                  </>
                )}
              </div>
            )}

            {/* Quick 3D Tool Controls (Top-Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              {/* Auto-rotate toggle */}
              <button
                type="button"
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isAutoRotating
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-sm"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="স্বয়ংক্রিয় রোটেশন চালু/বন্ধ করুন"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotating ? "animate-spin" : ""}`} />
              </button>

              {/* Wireframe Toggle */}
              <button
                type="button"
                onClick={() => setIsWireframe(!isWireframe)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isWireframe
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="ওয়্যারফ্রেম থ্রিডি মোড"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Interactive Specs & Direct Purchase Hub (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 text-white">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  {currentProduct.categoryName || "ফ্ল্যাগশিপ গ্যাজেট"}
                </span>
                <span className="text-[10px] bg-indigo-950 border border-indigo-700/50 text-indigo-300 px-2 py-0.5 rounded-full">
                  SKU: {currentProduct.sku || "PRO-3D"}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentProduct.name}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  ৳{price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-600/40">
                  ইনস্ট্যান্ট স্টক রেডি
                </span>
              </div>
            </div>

            {/* Colorway / Texture Selector in 3D */}
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-indigo-900/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                কালার ও মেটালিক ফিনিশ সিলেক্টর:
              </span>
              <div className="flex items-center gap-2.5">
                {colorways.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setActiveColorway(col.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition cursor-pointer text-xs font-bold ${
                      activeColorway === col.id
                        ? "border-indigo-400 bg-indigo-950 text-white shadow-xs"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${col.bg} border border-white/20`} />
                    <span className="text-[11px]">{col.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Studio Atmosphere Switcher */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-indigo-900/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                স্টুডিও লাইটিং প্রিসেট:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLightingPreset("cyber")}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition cursor-pointer text-center ${
                    lightingPreset === "cyber"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-xs"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  ⚡ সায়বার নিয়ন
                </button>
                <button
                  type="button"
                  onClick={() => setLightingPreset("studio")}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition cursor-pointer text-center ${
                    lightingPreset === "studio"
                      ? "bg-white/20 text-white border-white shadow-xs"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  💡 স্টুডিও হোয়াইট
                </button>
                <button
                  type="button"
                  onClick={() => setLightingPreset("luxury")}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black border transition cursor-pointer text-center ${
                    lightingPreset === "luxury"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-xs"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  👑 লাক্সারি গোল্ড
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(currentProduct);
                  addToast(`${currentProduct.name} কার্টে যোগ হয়েছে!`, "success");
                }}
                className="py-3 px-4 rounded-xl border border-indigo-700/80 hover:bg-indigo-950 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্টে যোগ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(currentProduct);
                  addToast(`${currentProduct.name} নির্বাচন করে সরাসরি চেকআউটে যাওয়া হচ্ছে...`, "success");
                  setStoreView("checkout");
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>সরাসরি অর্ডার করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
