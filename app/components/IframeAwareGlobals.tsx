"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const RightDrawer = dynamic(() => import("./RightDrawer"), { ssr: false });
const AutoChainSwitcher = dynamic(() => import("./AutoChainSwitcher"), { ssr: false });

const WALLET_ROUTES = ["/admin", "/event", "/quest", "/base", "/armory"];

export default function IframeAwareGlobals() {
  const [isInIframe, setIsInIframe] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  if (isInIframe) {
    return null;
  }

  const needsWallet = WALLET_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!needsWallet) {
    return null;
  }

  return (
    <>
      <AutoChainSwitcher />
      <RightDrawer />
    </>
  );
}
