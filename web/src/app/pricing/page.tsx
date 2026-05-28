import type { Metadata } from "next";

import { PricingPage } from "@/components/landing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — KindleDict",
  description:
    "Compare KindleDict plans for free testing, single-book generation, and author or publisher delivery.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
