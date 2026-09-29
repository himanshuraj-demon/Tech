"use client"


import { ContactHero } from "@/components/contact-hero"
import { GoogleMaps } from "@/components/google-maps"
import { FAQAccordion } from "@/components/faq-accordion"


export default function ContactPage() {



  return (
    <div className="flex flex-col pt-10">
      {/* Hero Section with Background Boxes */}
      <ContactHero />

      {/* Map Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container px-4 md:px-6">
          <GoogleMaps />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Quick answers to common questions
              </p>
            </div>

            <FAQAccordion />
          </div>
        </div>
      </section>
    </div>
  )
}
