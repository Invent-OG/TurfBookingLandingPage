"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./style.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const testimonials = [
  {
    name: "John Smith",
    role: "Football Team Captain",
    content:
      "The booking process is incredibly smooth. We've been using this service for our team practice sessions, and it's been fantastic!",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Sarah Johnson",
    role: "Sports Event Organizer",
    content:
      "Perfect for organizing tournaments. The multiple turf options and flexible timing make it ideal for large events.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "Michael Chen",
    role: "Regular Player",
    content:
      "The pricing is competitive and the turf quality is consistently great. Highly recommended for casual players!",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    name: "John Smith",
    role: "Football Team Captain",
    content:
      "The booking process is incredibly smooth. We've been using this service for our team practice sessions, and it's been fantastic!",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
];

export const SliderSectionForTestimonials = () => {
  return (
    <section className="section slider-section py-20 w-full flex justify-center items-center">
      <div className="container mx-auto w-[60%]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          centeredSlides
          slidesPerView={1}
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 10 }, // Show 1 image on phone screens
            640: { slidesPerView: 1, spaceBetween: 10 },
            1024: { slidesPerView: 1, spaceBetween: 10 },
          }}
          className="swiper-container"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <div className="testimonial-card bg-white p-8 rounded-2xl shadow">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SliderSectionForTestimonials;