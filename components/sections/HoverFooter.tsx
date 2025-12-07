"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { TextHoverEffect } from "@/components/ui/hover-footer";

export default function HoverFooter() {
  // Footer link data
  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/#about" },
        { label: "Features", href: "/#features" },
        { label: "Book Now", href: "/booking" },
        { label: "Contact", href: "/#contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQs", href: "/#faq" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-turf-neon" />,
      text: "support@turfbook.com",
      href: "mailto:support@turfbook.com",
    },
    {
      icon: <Phone size={18} className="text-turf-neon" />,
      text: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: <MapPin size={18} className="text-turf-neon" />,
      text: "Chennai, India",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
  ];

  return (
    <footer className="bg-turf-dark/80 backdrop-blur-md relative h-fit overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-turf-neon text-3xl font-extrabold">T</span>
              <span className="text-white text-3xl font-bold font-heading italic uppercase">
                TURF<span className="text-turf-neon">BOOK</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              The ultimate platform for booking premium sports arenas. Play your
              game, your way.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="hover:text-turf-neon transition-colors text-gray-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center space-x-3 text-gray-400"
                >
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-turf-neon transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-turf-neon transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-white/10 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 text-gray-500">
          {/* Social icons */}
          <div className="flex space-x-6">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-turf-neon transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} TurfBook. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36 relative z-0 pointer-events-auto">
        <TextHoverEffect text="TURFBOOK" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
