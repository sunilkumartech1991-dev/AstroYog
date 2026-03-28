import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AstroYog</h3>
            <p className="text-gray-400">
              Your trusted platform for astrology consultations in India.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/astrologers" className="text-gray-400 hover:text-white">Astrologers</Link></li>
              <li><Link to="/daily-horoscope" className="text-gray-400 hover:text-white">Daily Horoscope</Link></li>
              <li><Link to="/kundli" className="text-gray-400 hover:text-white">Kundli</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: support@astroyog.com</p>
            <p className="text-gray-400">Phone: +91 98765 43210</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 AstroYog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
