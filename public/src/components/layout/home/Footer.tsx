import React from "react";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandYoutube,
} from "@tabler/icons-react";

export const Footer: React.FC = () => {
  return (
    <>
      <div className="w-full bg-primarypink text-white md:flex md:justify-center md:items-center">
        <div className="container grid gap-4 justify-start px-4 py-12 md:flex md:justify-between">
          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold md:text-xl">Pathosafe</p>
            <div className="flex flex-col gap-2">
              <a
                href="/about"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Tentang Kami
              </a>
              <a
                href="/about"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Karier
              </a>
              <a
                href="/about"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Hubungi Kami
              </a>
              <a
                href="/about"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Langganan
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold md:text-xl">Lainnya</p>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Syarat & Ketentuan
              </a>
              <a
                href="#"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Privasi
              </a>
              <a
                href="#"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Iklan
              </a>
              <a
                href="#"
                className="relative text-md w-max after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-full after:bg-white after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                FAQ
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-lg font-bold md:text-xl">Media Sosial</p>
            <div className="flex gap-4 md:gap-6">
              <IconBrandFacebook className="cursor-pointer w-8 h-8 hover:opacity-80 transition-all duration-300 ease-in-out" />
              <IconBrandTwitter className="cursor-pointer w-8 h-8 hover:opacity-80 transition-all duration-300 ease-in-out" />
              <IconBrandLinkedin className="cursor-pointer w-8 h-8 hover:opacity-80 transition-all duration-300 ease-in-out" />
              <IconBrandInstagram className="cursor-pointer w-8 h-8 hover:opacity-80 transition-all duration-300 ease-in-out" />
              <IconBrandYoutube className="cursor-pointer w-8 h-8 hover:opacity-80 transition-all duration-300 ease-in-out" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-primarypink md:flex md:justify-center md:items-center">
        <div className="container border-t border-t-white p-4">
          <p className="font-bold text-white">
            ©PATHOSAFE, 2024. ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </>
  );
};
