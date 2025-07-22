import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./style.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
interface Props {
  images: {
    image: string;
  }[];
}
export  const  SliderSection: React.FC<Props> = ({ images }) => {
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
            1024: { slidesPerView: 2.5, spaceBetween: 20 }, // Show 2.5 images for desktops
          }}
          className="swiper-container"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <img
                src={src.image}
                alt={`Slide ${index + 1}`}
                className="w-full object-cover rounded-lg transition-transform duration-300 h-[75vh] md:h-[50vh] lg:h-[70vh] xl:h-[75vh]"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SliderSection;
