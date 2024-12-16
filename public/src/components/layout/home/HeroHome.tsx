import heroImages from "@/assets/images/home/hero2.png";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useNavigate } from "react-router-dom";

const HeroHome = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center items-center my-8">
      <div className="container w-[80%] flex flex-col lg:grid lg:grid-cols-2 justify-center lg:gap-16 items-center">
        <img src={heroImages} className="rounded-lg" />
        <div className="md:mt-0 mt-5 text-black">
          <TextGenerateEffect
            words={`Find Superior Pharmacy and Trusted Medications Easily!`}
            className="text-4xl xl:text-5xl text-primarypink transition-colors font-bold "
            duration={0.5}
          />
          <p className="py-6 text-base lg:text-lg text-justify text-foreground transition-colors text-wrap">
            Discover a wide variety of medications, delivered directly to your
            door with guaranteed quality and safety.
          </p>
          <Button
            className="bg-primarypink text-white border border-transparent px-4 py-6 rounded-md w-[50%] hover:bg-white hover:border-primarypink hover:text-primarypink transition-all duration-300 ease-in-out text-lg"
            onClick={() => navigate("/product")}
          >
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroHome;
