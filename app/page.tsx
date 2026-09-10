import Image from "next/image";
import Qubit from "./qubit";

export default function Home() {
  return (
    <main className="holding-page">
      <header className="identity">
        <div className="club-identity">
          <Image
            src="/qatlsvg.svg"
            alt=""
            width={856}
            height={359}
            preload
            className="club-logo"
          />
          <span className="club-name">Quantum @ Lehigh</span>
        </div>
        <h1>Coming soon.</h1>
      </header>
      <Qubit />
    </main>
  );
}
