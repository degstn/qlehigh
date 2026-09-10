import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-8 py-16">
      <Image
        src="/qatlsvg.svg"
        alt="Quantum at Lehigh"
        width={856}
        height={359}
        preload
        className="h-auto w-56 sm:w-72"
      />
      <p className="text-base sm:text-lg">Coming soon.</p>
    </main>
  );
}
