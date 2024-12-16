import carouselOneImg from "@/assets/images/home/1.png";
import carouselTwoImg from "@/assets/images/home/2.png";
import carouselThreeImg from "@/assets/images/home/3.png";
import React from "react";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CarouselHome: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-center my-8">
      <div className="container w-[80%] shadow-md">
        <Carousel
          className="h-[40vh] w-auto mx-auto"
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {Array.from([carouselOneImg, carouselTwoImg, carouselThreeImg]).map(
              (img, index) => (
                <CarouselItem key={index + 1}>
                  <div className="h-full p-1 rounded-lg border-zinc-500">
                    <img
                      src={img}
                      alt="Carousel Image"
                      className="h-[40vh] w-full object-cover "
                    />
                  </div>
                </CarouselItem>
              )
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default CarouselHome;
