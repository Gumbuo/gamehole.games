"use client";
import { useEffect, useRef } from "react";

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.self !== window.top) return;
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  if (typeof window !== "undefined" && window.self !== window.top) return null;

  return (
    <>
      <video
        ref={videoRef}
        src="/alien.mp4"
        muted
        loop
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(5, 5, 20, 0.75)",
        zIndex: 1,
        pointerEvents: "none",
      }} />
    </>
  );
}
