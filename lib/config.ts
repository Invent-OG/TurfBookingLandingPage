import { Calendar, CreditCard, Users, Clock } from "lucide-react";

export const siteConfig = {
  name: "TurfBook",
  description: "Book your perfect turf anytime, anywhere",
  hero: {
    title: "Find Your Turf. Play Anytime.",
    subtitle:
      "Experience seamless booking for your next game. Premium turfs, instant confirmation, and hassle-free scheduling.",
    images: [
      "/images/Carousel/Comp 1_00002.webp",
      "/images/Carousel/Comp 1_00006.webp",
      "/images/Carousel/Comp 1_00008.webp",
    ],
  },
  morningTimes: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"],
  eveningTimes: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
  disableReasons: [
    "Under Maintenance",
    "Coming Soon",
    "Private Event",
    "Renovation",
    "Custom Reason",
  ],
  slotIntervals: [
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "120 minutes" },
  ],
  features: [
    {
      icon: Calendar,
      title: "Easy Booking",
      description:
        "Book your preferred slot in just a few clicks with our intuitive booking system.",
    },
    {
      icon: CreditCard,
      title: "Affordable Rates",
      description:
        "Competitive pricing with special offers for regular players and teams.",
    },
    {
      icon: Users,
      title: "Multiple Turf Options",
      description:
        "Choose from various turf sizes and types to suit your game requirements.",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Book your slot anytime, day or night, with instant confirmation.",
    },
  ],

  gallery: [
    {
      title: "Premium Turf Field",
      image:
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Premium Turf Field",
      image:
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Night Games",
      image:
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Training Sessions",
      image:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ],
  testimonials: [
    {
      name: "John Smith",
      role: "Football Team Captain",
      content:
        "The booking process is incredibly smooth. We've been using this service for our team practice sessions, and it's been fantastic!",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
    {
      name: "Sarah Johnson",
      role: "Sports Event Organizer",
      content:
        "Perfect for organizing tournaments. The multiple turf options and flexible timing make it ideal for large events.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
    {
      name: "Michael Chen",
      role: "Regular Player",
      content:
        "The pricing is competitive and the turf quality is consistently great. Highly recommended for casual players!",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
    },
  ],
  pricing: {
    weekday: {
      beforeSix: 50,
      afterSix: 70,
    },
    weekend: 80,
  },
  contact: {
    email: "contact@turfbook.com",
    phone: "+1 (555) 123-4567",
    address: "123 Sports Avenue, NY 10001",
  },
  social: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
  },
};
