"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MeshGradient,
  type MeshGradientProps,
} from "@paper-design/shaders-react";
import { SEED_PRODUCTS } from "../lib/api/queries";
import { useMutation } from "@apollo/client";
import ProductGrid from "./ProductGrid";

const BUTTON_BASE_CLASSES =
  "group relative h-32 flex flex-col items-center justify-center space-y-1 text-gray border-0 shadow-xl hover:shadow-2xl transition-all duration-100 hover:-translate-y-2 hover:scale-105 rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 ";
const BUTTON_OVERLAY_CLASSES =
  "absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500";
const BUTTON_ICON_CLASSES =
  "text-3xl mb-1 transform group-hover:scale-110 transition-transform duration-300";

function MeshGradientComponent({ speed, ...props }: MeshGradientProps) {
  return <MeshGradient {...props} speed={speed ? speed / 10 : 0.25} />;
}

export function LandingPage() {
  const [seeded, setSeeded] = useState(true);
  const [seedProducts, { loading: seeding }] = useMutation(SEED_PRODUCTS);

  const handleSeed = async () => {
    try {
      await seedProducts();
      setSeeded(true);
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Error seeding data. Check console for details.");
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <MeshGradientComponent
        speed={isLoading || seeding ? 50 : 1}
        className="absolute inset-0"
        colors={["#1e40af", "#3b82f6", "#6366f1", "#8b5cf6", "#f8fafc"]}
        distortion={0.6}
        swirl={0.3}
      />

      {/* Floating orbs with animation */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/30 to-slate-900/60" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-2xl backdrop-blur-xl mb-6 shadow-2xl h-16 w-48 bg-white border-transparent border-0 border-none mt-3">
            <img
              src="https://app.mandrel.tech/images/logo_with_name.svg"
              alt="Mandrel Logo"
              className="w-full h-full object-contain p-4"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-100 tracking-tight drop-shadow-lg">
            Grid Challenge
          </h1>
        </div>

        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 gap-6 w-full">
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className={`${BUTTON_BASE_CLASSES} w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600 transition-all duration-700 ${
                seeded
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-50 scale-95 translate-y-2"
              }`}
            >
              <div className={BUTTON_OVERLAY_CLASSES} />
              <div className={BUTTON_ICON_CLASSES}>🌐</div>
              <div className="font-semibold text-lg">
                {seeding ? "Seeding..." : "Seed Data"}
              </div>
              <div className="text-sm opacity-90 font-medium">
                Generate fake data in the database - requires refresh
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* ProductGrid outside the max-width container to allow full viewport expansion */}
      <div className="relative z-10 w-full p-12">
        <ProductGrid isLoadingCallback={setIsLoading} />
      </div>
    </div>
  );
}
