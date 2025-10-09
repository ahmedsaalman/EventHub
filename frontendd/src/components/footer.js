// components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black bg-opacity-50 py-12 border-t border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="text-2xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent mb-4">
                EventHub
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting people through unforgettable events and experiences worldwide. 
              Your premier platform for event discovery and management.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Platform</h3>
            <ul className="space-y-3">
              {[
                { name: 'Browse Events', href: '#events' },
                { name: 'Create Event', href: '/create' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Features', href: '#features' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '/help' },
                { name: 'Community', href: '/community' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-400 hover:text-white transition duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              {[
                { icon: 'fab fa-twitter', href: '#' },
                { icon: 'fab fa-facebook', href: '#' },
                { icon: 'fab fa-instagram', href: '#' },
                { icon: 'fab fa-linkedin', href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-opacity-20 transition duration-300"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
            <div className="text-gray-400 text-sm">
              <p>📧 hello@eventhub.com</p>
              <p className="mt-1">📞 +1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 EventHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition duration-300">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition duration-300">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition duration-300">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}