
import Head from 'next/head';
import Header from './header.js';
import Footer from './footer.js';

export default function Layout({ children, title = "EventHub - Discover Amazing Events" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Find and create unforgettable events with EventHub" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}