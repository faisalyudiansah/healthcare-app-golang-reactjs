import heroImages from "@/assets/svg/about/hero.svg";
import hero2Images from "@/assets/svg/about/hero-2.svg";
import hero3Images from "@/assets/svg/about/hero-3.svg";
import hero4Images from "@/assets/svg/about/hero-4.svg";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import TimelineAbout from "./TimelineAbout";
import { useNavigate } from "react-router-dom";
import { ImagesSlider } from "@/components/ui/images-slider";
import { motion } from "framer-motion";

const words = [
  {
    text: "Budaya",
  },
  {
    text: "Kerja",
  },
  {
    text: "Sehat,",
  },
  {
    text: "Terdepan",
  },
  {
    text: "Dalam",
  },
  {
    text: "Pelayanan.",
    className: "text-primarypink",
  },
];

const works = [
  {
    title: "Terpercaya",
    description:
      "Pathosafe sudah memiliki izin resmi dari pemerintah Indonesia, membuat Pathosafe memiliki izin pengedaran yang legal dan sudah dijamin oleh negara.",
    link: "https://stripe.com",
    img: <img src={hero2Images} alt="Hero" />,
  },
  {
    title: "Racikan Obat Terbaik",
    description:
      "Pathosafe memiliki lebih dari 10.000 produk yang diterbitkan oleh lebih dari 500 manufaktur (pabrik), yang memungkinkan pengguna untuk memilih berbagai jenis obat dari berbagai jenis penerbit.",
    link: "https://netflix.com",
    img: <img src={hero3Images} alt="Hero" />,
  },
  {
    title: "Menyediakan Layanan Tercepat",
    description:
      "Pathosafe memiliki lebih dari 750.000 farmasi yang tersedia di daerah Jabodetabek. Dengan banyaknya jumlah farmasi ini, Pathosafe dapat memberikan jaminan layanan tercepat!",
    link: "https://google.com",
    img: <img src={hero4Images} alt="Hero" />,
  },
];

const images = [
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/q9v6krqhrhw73bcoaeff",
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/jkk0hydxn0x0mts7vgup",
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/jtzd1hg9q8qdgnnlysv9",
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/ufbpvxuqtkh0106m1csk",
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/uksy2vy7sizmiogmo6wd",
  "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/vsif8fz2bmkimiuuugh1",
];

const HeroAbout = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="min-h-[600px] py-12">
        <div className="flex flex-col lg:flex-row justify-center lg:gap-32 items-center">
          <img
            src={heroImages}
            alt="Hero"
            className="lg:w-[600px] w-[340px] md:w-[500px] rounded-lg"
          />
          <div className="md:mt-0 mt-5 p-5 lg:w-[600px] text-black">
            <TypewriterEffect words={words} />
            <p className="py-6  text-md text-justify text-foreground transition-colors">
              Pathosafe adalah platform kesehatan digital. Sejak tahun 2024,
              Pathosafe telah unggul dalam menyediakan obat-obatan yang dapat
              diakses oleh siapa saja, kapan saja, dan di mana saja.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-primarypink hover:bg-secondarypink w-40 h-12 border-none text-foreground transition-colors rounded-2xl text-white font-medium"
            >
              Join us
            </button>
          </div>
        </div>
      </section>
      <section className="min-h-[600px] py-12">
        <div className="flex flex-col justify-center  items-center">
          <h1 className="text-2xl lg:text-5xl text-foreground transition-colors font-bold">
            What do we do?
          </h1>
          <div className="flex mx-auto px-16">
            <HoverEffect items={works} />
          </div>
        </div>
      </section>

      <div className="relative">
        <TimelineAbout />
      </div>

      <div className="w-full my-24">
        <div className="container w-[80%] flex items-center justify-center mx-auto">
          <ImagesSlider className="h-[40rem] rounded-lg" images={images}>
            <motion.div
              initial={{
                opacity: 0,
                y: -80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="z-50 flex flex-col justify-center items-center"
            >
              <motion.p className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
                Perjalanan <br /> Pathosafe
              </motion.p>
            </motion.div>
          </ImagesSlider>
        </div>
      </div>

      <div className="h-[40rem] w-full flex flex-col items-center justify-center gap-12">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-pink-400 to-pink-600">
          Pathosafe <br /> Number 1 Telemedicine.
        </h1>
        <p className="mt-4 font-normal text-lg text-foreground max-w-lg text-center mx-auto">
          Seluruh fitur Pathosafe tersedia dalam versi web dan mobile app yang
          mudah diakses melalui perangkat komputer maupun ponsel pintar oleh
          seluruh masyarakat Indonesia, kapan saja, di mana saja.
        </p>
      </div>
    </>
  );
};

export default HeroAbout;
