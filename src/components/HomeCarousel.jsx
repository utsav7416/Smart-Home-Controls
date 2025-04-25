import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function HomeCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80",
      title: "Smart Living Made Simple",
      description: "Control your entire home with a single tap"
    },
    {
      image: "https://images.unsplash.com/photo-1527359443443-84a48aec73d2?auto=format&fit=crop&w=1600&q=80",
      title: "Energy Efficient",
      description: "Save money while saving the planet"
    },
    {
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80",
      title: "Secure & Connected",
      description: "Keep your home safe and connected 24/7"
    }
  ];

  return (
    
    <div className="mb-12 rounded-xl overflow-hidden">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="relative h-[400px]">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
              <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
              <p className="text-xl">{slide.description}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default HomeCarousel;