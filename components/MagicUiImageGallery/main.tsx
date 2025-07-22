import { BlurFade } from "../ui/blur-fade";

const images = Array.from(
  { length: 9 },
  (_, i) => `/images/Gallery/image${i + 1}.webp`
);

export function BlurFadeDemo() {
  return (
    <div className="py-16 bg-white text-gray-900">
      {/* Header Section */}

      <div className="text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Explore Our Turf
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
          High-quality turf spaces designed for your best game.
        </p>
      </div>

      {/* Gallery Grid */}
      <section id="photos">
        <div className="columns-2 gap-5 px-10 md:px-[10%] mt-10 sm:columns-3">
          {images.map((imageUrl, idx) => (
            <BlurFade key={imageUrl} delay={0.25 + idx * 0.05} inView>
              <img
                className="mb-4 size-full rounded-lg object-contain"
                src={imageUrl}
                alt={`Gallery image ${idx + 1}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>
    </div>
  );
}
