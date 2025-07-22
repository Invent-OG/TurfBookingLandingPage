import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./style.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { siteConfig } from "@/lib/config";
import { Card } from "antd";
import { motion } from "framer-motion";


export const SliderSectionForTurfCard= () => {
  return (
    <section className="section slider-section py-20 w-full flex justify-center items-center">
      <div className="container mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          centeredSlides
          slidesPerView={1} // Default to 1 slide per view for smaller screens
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 10 }, // Show 1 image on phone screens
            640: { slidesPerView: 1.5, spaceBetween: 20 }, // Show 1.5 images for slightly larger screens
            1024: { slidesPerView: 3, spaceBetween: 30 }, // Show 2.5 images for desktops
          }}
          className="swiper-container"
        >
          {siteConfig.gallery.map((turf, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="rounded-lg overflow-hidden shadow-lg"
              >
                <Card
                  cover={
                    <img
                      alt={turf.title}
                      src={turf.image}
                      className="h-48 w-full object-cover"
                    />
                  }
                  className="h-full"
                >
                  <Card.Meta
                    title={turf.title}
                    description="Available for booking"
                  />
                </Card>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SliderSectionForTurfCard;
