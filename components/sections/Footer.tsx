"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const socialLinks = [
    { icon: Facebook, href: "#" },
    {
      icon: Instagram,
      href: "https://www.instagram.com/templecitysportsclub/?hl=en",
    },
    { icon: Twitter, href: "#" },
  ];

  // const contactInfo = [
  //   { icon: Mail, text: "contact@turfbook.com" },
  //   { icon: Phone, text: "+91 91515 96868" },
  //   {
  //     icon: MapPin,
  //     text: "bypass, opp. to DSR madhanam inn, Malik Nagar, Asur, Kumbakonam, Tamil Nadu, Kumbakonam 612001",
  //   },
  // ];

    const contactInfo = [
    { icon: Mail, text: "contact@turfbook.com" },
    { icon: Phone, text: "+91 99999 99999" },
    {
      icon: MapPin,
      text: "coimbatore, Tamil Nadu, 600000",
    },
  ];

  return (
    <footer className="relative bg-black text-white py-16 px-6">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-black to-transparent opacity-90"></div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 z-10">
        {/* Left: Branding */}
        <div className="space-y-6">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 text-transparent bg-clip-text">
            TurfBook
          </h3>
          <p className="text-gray-400">
            Book your perfect turf anytime, anywhere. Experience seamless
            booking and premium facilities at your fingertips.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => {
                router.push("/booking");
              }}
              className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl shadow-lg transition"
            >
              Book Now
            </Button>
          </motion.div>
          <Button onClick={()=> router.push("/admin/bookings")}>
          Admin Login
        </Button>
        </div>

        {/* Middle: Contact Details */}
        {/* <div>
          <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
          <div className="space-y-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{info.text}</span>
                </div>
              );
            })}
          </div>
        </div> */}
        
        <div>
          <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
          <div className="space-y-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const isEmail = info.text.includes("@"); // Check if it's an email

              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-green-400" />
                  {isEmail ? (
                    <a
                      href={`mailto:${info.text}`}
                      className="text-gray-300 underline"
                    >
                      {info.text}
                    </a>
                  ) : (
                    <span className="text-gray-300">{info.text}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Social Links */}
        {/* <div>
          <h3 className="text-xl font-semibold mb-6">Follow Us</h3>
          <div className="flex space-x-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 hover:text-green-400 transition-all"
                >
                  <Icon className="h-7 w-7" />
                </motion.a>
              );
            })}
          </div>
        </div> */}
      </div>

      {/* Bottom Copyright */}
      <div className="text-center  text-gray-500 text-sm border-t border-gray-700 mt-12">
        {/* <p>&copy; {new Date().getFullYear()}@2025 TempleCity. All rights reserved.</p> */}
        <p>&copy; {new Date().getFullYear()}@2025 TurfBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
