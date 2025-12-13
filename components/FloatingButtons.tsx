import { FaPhone, FaWhatsapp } from "react-icons/fa";

const FloatingButtons = () => {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 flex z-50 flex-col items-end space-y-3">
      {/* Phone Button */}
      <a
        href="tel:+918883888025"
        className="flex items-center justify-center w-12 h-12 bg-turf-neon text-black p-3 rounded-full shadow-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-110 hover:bg-white transition-all duration-300"
      >
        <FaPhone size={20} />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/8883888025"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 hover:shadow-[0_0_15px_#25D366] transition-all duration-300"
      >
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
};

export default FloatingButtons;
