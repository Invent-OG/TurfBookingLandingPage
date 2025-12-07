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
    <footer className="relative text-white py-16 px-6">
      {/* Background Effect Removed */}

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 z-10">
        {/* Left: Branding */}
        <div className="space-y-6">
          <h3 className="text-3xl font-black font-heading tracking-wider">
            TURF<span className="text-turf-neon">BOOK</span>
          </h3>
          <p className="text-gray-400 leading-relaxed">
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
              className="bg-turf-neon hover:bg-turf-neon/80 text-turf-dark font-bold px-8 py-6 rounded-xl shadow-lg shadow-neon-green transition-all"
            >
              Book Now
            </Button>
          </motion.div>

          <div className="pt-4">
            <Button
              onClick={() => router.push("/admin/bookings")}
              variant="outline"
              className="border-white/10 text-gray-400 hover:text-white hover:border-turf-neon hover:bg-turf-neon/10"
            >
              Admin Login
            </Button>
          </div>
        </div>

        {/* Middle: Contact Details */}
        <div>
          <h3 className="text-xl font-bold mb-6 font-heading uppercase text-turf-blue">
            Contact Us
          </h3>
          <div className="space-y-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const isEmail = info.text.includes("@");

              return (
                <div key={index} className="flex items-start space-x-3 group">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-turf-neon/10 transition-colors">
                    <Icon className="h-5 w-5 text-turf-neon group-hover:drop-shadow-[0_0_5px_rgba(204,255,0,0.5)] transition-all" />
                  </div>
                  {isEmail ? (
                    <a
                      href={`mailto:${info.text}`}
                      className="text-gray-400 hover:text-white transition-colors pt-1"
                    >
                      {info.text}
                    </a>
                  ) : (
                    <span className="text-gray-400 pt-1 leading-relaxed">
                      {info.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Social Links (Hidden in original code but preserving structure if needed later) */}
        <div className="hidden md:block">
          {/* Placeholder for future content or map */}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-gray-600 text-sm border-t border-white/5 mt-16 pt-8">
        <p>&copy; {new Date().getFullYear()} TurfBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
