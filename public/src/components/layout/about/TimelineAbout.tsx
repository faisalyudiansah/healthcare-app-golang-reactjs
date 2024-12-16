import React from "react";
import { Timeline } from "@/components/ui/timeline";

const TimelineAbout: React.FC = () => {
  const data = [
    {
      title: "2022",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg font-medium mb-8">
            Membangun dan menerbitkan Pathosafe dari awal
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg mb-8">
            Pathosafe bermula dari 100 farmasi saja yang tersedia hanya di
            daerah Jakarta Selatan, dengan jumlah produk hanya sekitar 120
            produk yang diterbitkan dari 10 manufaktur berbeda.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/x9ez4brfxtmr479toibi"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/acqlr6nqthjceqlhnrdr"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/cetcc3k38vqblgs2ry3q"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/dzrfyhpzv3mdck8s4shd"
              alt="startup template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Early 2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl font-normal mb-8">
            Pathosafe mendapatkan izin resmi dari pemerintah Indonesia untuk
            mengedarkan obat secara legal di seluruh daerah Jabodetabek.
            Pathosafe mulai membuka luas pasar dengan menjalin kerjasama dengan
            lebih dari{" "}
            <span className="text-primarypink font-medium">
              200.000 farmasi
            </span>{" "}
            yang tersedia di seluruh daerah Jabodetabek.
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-xl font-normal mb-8">
            Pathosafe memperluas varian produk dengan mengedarkankan lebih dari{" "}
            <span className="text-primarypink font-medium">
              10.000 jenis produk
            </span>{" "}
            yang diproduksi oleh lebih dari{" "}
            <span className="text-primarypink font-medium">500 manufaktur</span>{" "}
            yang berbeda.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.bisnis.com/posts/2021/01/20/1345409/cpns-bpom.jpg"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://storage.googleapis.com/danacita-website-v3-prd/website_v3/images/Danacita_-_Jurusan_Farmasi.original.jpg "
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://cdn.medcom.id/dynamic/content/2020/09/16/1188930/bFsPVjt2h4.jpg?w=480"
              alt="bento template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src="https://pedagangbesarfarmasi.com/wp-content/uploads/2020/11/pedagang-besar-farmasi.jpg"
              alt="cards template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg font-normal mb-4">
            Pathosafe meraih berbagai penghargaan seperti
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg">
              ✅ Menjadi satu-satunya mitra yang menjalin kerjasama dengan lebih
              dari 750.000 farmasi di seluruh daerah Jabodetabek.
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg">
              ✅ Mengedarkan lebih dari 10.000 produk yang tersedia di lebih
              dari 750.000 farmasi berbeda di seluruh daerah Jabodetabek.
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg">
              ✅ Memperoleh piagam penghargaan dari pemerintah Indonesia karena
              pelayanan yang cepat dan terpercaya.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/aw7snjppjmva6vw08maw"
              alt="hero template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src={
                "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/q9v6krqhrhw73bcoaeff"
              }
              alt="feature template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src={
                "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/jkk0hydxn0x0mts7vgup"
              }
              alt="bento template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
            <img
              src={
                "https://res.cloudinary.com/dt0izni19/image/upload/f_auto,q_auto/jtzd1hg9q8qdgnnlysv9"
              }
              alt="cards template"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
};

export default TimelineAbout;
