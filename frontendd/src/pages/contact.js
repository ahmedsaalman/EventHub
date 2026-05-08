import Layout from "@/components/Layout";

export default function ContactPage() {
  return (
    <Layout title="Contact | EventHub">
      <section className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white">Contact EventHub</h1>
          <p className="text-gray-300 mt-4">
            EventHub is built and maintained by Ahmed Salman. For collaboration, support, or
            product feedback, use the channels below.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">Owner</h2>
              <p className="text-gray-300 mt-2">Ahmed Salman</p>
              <p className="text-gray-300 mt-1">Email: ahmad04salman@gmail.com</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white text-xl font-semibold">Profiles</h2>
              <ul className="text-gray-300 mt-2 space-y-2">
                <li>
                  LinkedIn:{" "}
                  <a
                    className="text-purple-400 hover:text-purple-300"
                    href="https://www.linkedin.com/in/ahmad04salman/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ahmad04salman
                  </a>
                </li>
                <li>
                  GitHub:{" "}
                  <a
                    className="text-purple-400 hover:text-purple-300"
                    href="https://github.com/ahmedsaalman/EventHub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ahmedsaalman/EventHub
                  </a>
                </li>
                <li>Instagram: _1hmed_</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
