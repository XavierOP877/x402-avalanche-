import { HeroSection } from "@/components/pages/home/hero"
import { X402Section } from "@/components/pages/home/x402"
import { FacilitatorSection } from "@/components/pages/home/facilitator"
import { ComparisonTableSection } from "@/components/pages/home/comparison"
import { ProductsSection } from "@/components/pages/home/products"
import { WaysToUseSection } from "@/components/pages/home/ways-to-use"
import { WaitlistSection } from "@/components/pages/home/waitlist"
import { Footer } from "@/components/layout/footer"

import { HERO_DATA } from "@/lib/data/home/hero"
import { X402_DATA } from "@/lib/data/home/x402"
import { FACILITATOR_DEFINITION_DATA } from "@/lib/data/home/facilitator"
import { COMPARISON_TABLE_DATA } from "@/lib/data/home/comparison"
import { PRODUCTS_DATA } from "@/lib/data/home/products"
import { WAYS_TO_USE_DATA } from "@/lib/data/home/ways-to-use"
import { FOOTER_DATA } from "@/lib/data/footer"

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection data={HERO_DATA} />

      <div className="space-y-0">
        {/* 2. What is X402 */}
        <X402Section data={X402_DATA} />

        {/* 3. Facilitator */}
        <FacilitatorSection data={FACILITATOR_DEFINITION_DATA} />

        {/* 4. Comparison Table */}
        <ComparisonTableSection data={COMPARISON_TABLE_DATA} />

        {/* 5. Product Suite */}
        <ProductsSection data={PRODUCTS_DATA} />

        {/* 6. Ways to Use */}
        <WaysToUseSection data={WAYS_TO_USE_DATA} />

        {/* 7. Waitlist */}
        <WaitlistSection />
      </div>

      <Footer data={FOOTER_DATA} />
    </>
  )
}


