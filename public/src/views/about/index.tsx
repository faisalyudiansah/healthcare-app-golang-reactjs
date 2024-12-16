import { Footer } from "@/components/layout/home/Footer";
import HeroAbout from "../../components/layout/about/HeroAbout";
import { useEffect } from "react";
import FloatingCart from "@/components/molecules/cart";

const About = () => {
  useEffect(() => {
    document.title = `Pathosafe - About`;
    return () => {
      document.title = "Pathosafe";
    };
  }, []);

  return (
    <>
      <HeroAbout />
      <Footer />
      <FloatingCart />
    </>
  );
};

export default About;
