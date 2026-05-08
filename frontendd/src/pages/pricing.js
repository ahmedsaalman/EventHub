import Link from "next/link";
import Layout from "@/components/Layout";

const plans = [
  {
    name: "Starter",
    price: "0 PKR",
    description: "Best for testing and small community events.",
    features: [
      "Create and publish events",
      "Sell tickets online",
      "Attendee dashboard access",
      "Basic email support",
    ],
  },
  {
    name: "Organizer Pro",
    price: "4,999 PKR / month",
    description: "For active organizers managing multiple events.",
    features: [
      "Everything in Starter",
      "Advanced analytics and revenue insights",
      "Ticket category controls and limits",
      "Priority support and attendee exports",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams needing custom workflows and scale.",
    features: [
      "Everything in Organizer Pro",
      "Dedicated onboarding",
      "Custom integrations",
      "Admin governance and role controls",
    ],
  },
];

export default function PricingPage() {
  return (
    <Layout title="Pricing | EventHub">
      <section className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            EventHub Pricing
          </h1>
          <p className="text-gray-300 mt-4 text-center max-w-3xl mx-auto">
            EventHub is an event ticketing platform built with Next.js and Django REST Framework.
            Every plan includes secure authentication, event management, and attendee workflows.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
                <p className="text-purple-400 font-bold mt-2">{plan.price}</p>
                <p className="text-gray-400 mt-3 text-sm">{plan.description}</p>
                <ul className="mt-4 space-y-2 text-gray-300 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/signup" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
