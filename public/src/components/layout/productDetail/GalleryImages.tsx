import { cn } from "@/lib/utils";
import React, { useState } from "react";

type Props = {
  images: Image[] | undefined;
  loading?: boolean;
};

type Image = {
  src?: string;
  alt: string;
};

const ImageSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-gray-200 rounded-md shadow-lg border relative animate-pulse",
        className
      )}
    ></div>
  );
};

const GalleryImages: React.FC<Props> = ({ images, loading = false }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const changeImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
      <div className="h-max md:h-[70%] rounded-lg">
        {loading ? (
          <ImageSkeleton className="h-[60vh]" />
        ) : (
          images?.map((data, index) => (
            <div
              key={index + 1}
              style={{
                display: selectedImageIndex === index ? "block" : "none",
              }}
              className="h-full rounded-lg flex items-center justify-center transition-all"
            >
              <img
                src={data.src}
                alt={data.alt}
                className="w-full h-full object-contain rounded-lg border-primarypink border border-opacity-15 transition-all"
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>
      <div className="w-[70%] flex gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, idx) => (
                <ImageSkeleton key={idx + 1} className="flex-1 h-24 md:h-32" />
              ))
          : images?.map((data, index) => {
              if (data.src) {
                return (
                  <div
                    className="flex-1"
                    key={index + 1}
                    onClick={() => changeImage(index)}
                    onKeyDown={() => changeImage(index)}
                  >
                    <img
                      src={data.src}
                      alt={data.alt}
                      className={`border-primarypink border border-opacity-15 cursor-pointer focus:outline-none w-full rounded-lg h-24 md:h-32 object-contain transition-all duration-300 ease-in-out ${
                        selectedImageIndex === index
                          ? ""
                          : "hover:opacity-80 opacity-40"
                      }`}
                    />
                  </div>
                );
              }
            })}
      </div>
    </>
  );
};

export default GalleryImages;
