import Layout from "@/components/Layout";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <Layout title="Community | EventHub">
      <section className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white">EventHub Community</h1>
          <p className="text-gray-300 mt-4">
            EventHub helps organizers and attendees connect around meaningful events. From local
            meetups to large conferences, the platform supports event discovery, ticket sales, and
            attendee engagement in one workflow.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">For Organizers</h2>
              <p className="text-gray-300 mt-2">
                Build event pages, configure tickets, track orders, and manage participants from a
                centralized organizer dashboard.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">For Attendees</h2>
              <p className="text-gray-300 mt-2">
                Browse categories, reserve seats, and keep event details in one place through a
                smooth ticketing experience.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/features" className="text-purple-400 hover:text-purple-300">
              Explore platform features ->
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
