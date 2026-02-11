"use client";
import dynamic from "next/dynamic";
import BackToMothershipButton from "../components/BackToMothershipButton";

const AlienArmory = dynamic(
  () => import("../base/components/AlienArmory"),
  { ssr: false }
);

export default function ArmoryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="p-4">
        <BackToMothershipButton />
      </div>
      <AlienArmory />
    </div>
  );
}
