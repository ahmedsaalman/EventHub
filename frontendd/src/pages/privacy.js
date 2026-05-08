import Layout from "@/components/Layout";

export default function PrivacyPage() {
  return (
    <Layout title="Privacy & Terms | EventHub">
      <section className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white">Privacy, Terms, and Cookies</h1>
          <p className="text-gray-300 mt-4">
            EventHub is an event ticketing platform built with Next.js and Django REST Framework.
            This page summarizes how data is used and platform expectations for users.
          </p>

          <div className="mt-10 space-y-6">
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">Privacy Policy</h2>
              <p className="text-gray-300 mt-2">
                We store essential account, event, and ticket data to provide platform features.
                We do not sell personal information. Access to admin tooling is role-based.
              </p>
            </section>

            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">Terms of Service</h2>
              <p className="text-gray-300 mt-2">
                Users must provide accurate information, follow local laws for events, and avoid
                misuse of ticketing or admin capabilities. Accounts violating these terms may be
                suspended by platform administrators.
              </p>
            </section>

            <section id="cookies" className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">Cookie Policy</h2>
              <p className="text-gray-300 mt-2">
                EventHub uses cookies and local storage for session management, authentication
                state, and performance improvements across the user dashboard and ticketing flow.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}
