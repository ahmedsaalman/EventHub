import Layout from "@/components/Layout";

export default function HelpPage() {
  return (
    <Layout title="Help Center | EventHub">
      <section className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white">Help Center</h1>
          <p className="text-gray-300 mt-4">
            EventHub is a modern event ticketing application powered by Next.js (frontend) and
            Django REST Framework (backend). This page answers common setup and usage questions.
          </p>

          <div className="mt-10 space-y-6">
            <article className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl text-white font-semibold">How do I create an event?</h2>
              <p className="text-gray-300 mt-2">
                Sign in as an organizer, open Organizer Dashboard, and use the event creation form
                to set title, date, location, ticket categories, and capacity.
              </p>
            </article>

            <article className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl text-white font-semibold">How does ticket validation work?</h2>
              <p className="text-gray-300 mt-2">
                Buyers receive ticket data with QR support. Organizers can scan tickets from the
                scanner module to verify authenticity and prevent duplicate entry.
              </p>
            </article>

            <article className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl text-white font-semibold">What does the admin dashboard include?</h2>
              <p className="text-gray-300 mt-2">
                The admin dashboard provides user moderation, event oversight, activity tracking,
                and management tools for safe platform operations.
              </p>
            </article>
          </div>
        </div>
      </section>
    </Layout>
  );
}
