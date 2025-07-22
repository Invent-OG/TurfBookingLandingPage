import { FaPhone, FaWhatsapp } from "react-icons/fa";

const FloatingButtons = () => {
  return (
    <div className="fixed bottom-6 right-6 flex z-50 flex-col items-end space-y-2">
      {/* Phone Button */}
      <a
        href="tel:+919151596868"
        className="flex items-center justify-center bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <FaPhone size={24} />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/9151596868"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
      >
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
};

export default FloatingButtons;
