import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-amber-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div>
            <h2 className="text-2xl font-bold text-amber-300 mb-4">Gourmet House</h2>
            <p className="text-amber-100 mb-6">
              Exquisite dining experience crafted with passion since 2010.
            </p>
            <div className="flex space-x-4">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="text-amber-200 hover:text-amber-300 transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Menu', 'Specials', 'Gallery', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`#${item.toLowerCase()}`}
                    className="text-amber-100 hover:text-amber-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-amber-100">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span>11:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>10:00 AM - 9:00 PM</span>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="text-amber-300 mt-1 mr-3" />
                <span className="text-amber-100">123 Culinary Street, Foodville</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="text-amber-300 mt-1 mr-3" />
                <span className="text-amber-100">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <FiMail className="text-amber-300 mt-1 mr-3" />
                <span className="text-amber-100">reservations@gourmethouse.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-amber-800 mt-12 pt-8 text-center text-amber-200">
          <p>© {currentYear} Gourmet House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}