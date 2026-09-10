"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

type Outcome = 0 | 1 | null;
type Measurement = {
  number: number;
  result: 0 | 1;
  probability: number;
  repeated: boolean;
};

const angleTicks = Array.from({ length: 12 }, (_, index) => {
  const radians = (index * Math.PI) / 6;
  const outerRadius = index % 3 === 0 ? 144 : 142;
  const point = (radius: number) =>
    `${(160 + radius * Math.sin(radians)).toFixed(3)} ${(160 - radius * Math.cos(radians)).toFixed(3)}`;
  return `M${point(137)}L${point(outerRadius)}`;
});

function ArrowIcon() {
  return (
    <svg className="social-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" focusable="false">
      <path d="M3 9 9 3M3 3h6v6" />
    </svg>
  );
}

export default function Qubit() {
  const [angle, setAngle] = useState(90);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const measurementCount = useRef(0);
  const probabilityZero = (1 + Math.cos((angle * Math.PI) / 180)) / 2;
  const percentZero = Math.round(probabilityZero * 100);
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const controlAngle = normalizedAngle === 0 && angle > 0 ? 360 : normalizedAngle;
  const radians = (controlAngle * Math.PI) / 180;
  const alpha = outcome === null ? Math.cos(radians / 2) : outcome === 0 ? 1 : 0;
  const beta = outcome === null ? Math.sin(radians / 2) : outcome === 1 ? 1 : 0;
  const formatAmplitude = (value: number) => Math.abs(value) < 0.0005 ? "0.000" : value.toFixed(3);
  const alphaText = formatAmplitude(alpha);
  const betaText = formatAmplitude(beta);
  const arcRadians = (Math.min(controlAngle, 359.9) * Math.PI) / 180;
  const angleArc = `M160 128 A32 32 0 ${controlAngle > 180 ? 1 : 0} 1 ${(160 + 32 * Math.sin(arcRadians)).toFixed(3)} ${(160 - 32 * Math.cos(arcRadians)).toFixed(3)}`;

  function prepare(nextAngle: number) {
    setAngle(nextAngle);
    setOutcome(null);
    setMeasurement(null);
  }

  function movePointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) < 12) return;

    const nextAngle = (Math.atan2(x, -y) * 180) / Math.PI;
    // Keep the nearest equivalent angle so dragging through 360° stays smooth.
    const delta = ((nextAngle - angle + 540) % 360 + 360) % 360 - 180;
    prepare(angle + delta);
  }

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    movePointer(event);
  }

  function endDrag(event: PointerEvent<SVGSVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    const steps: Record<string, number> = {
      ArrowRight: 5,
      ArrowUp: 5,
      ArrowLeft: -5,
      ArrowDown: -5,
    };
    if (event.key in steps) {
      event.preventDefault();
      const nextAngle = Math.max(0, Math.min(360, controlAngle + steps[event.key]));
      prepare(angle + nextAngle - controlAngle);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      prepare(event.key === "Home" ? 0 : 360);
    }
  }

  function measure() {
    const result = outcome ?? (Math.random() < probabilityZero ? 0 : 1);
    const priorProbability = result === 0 ? probabilityZero : 1 - probabilityZero;
    const repeated = outcome !== null;
    const target = result * 180;
    const delta = ((target - angle + 540) % 360 + 360) % 360 - 180;
    setAngle(angle + delta);
    setOutcome(result);
    measurementCount.current += 1;
    setMeasurement({
      number: measurementCount.current,
      result,
      probability: priorProbability,
      repeated,
    });
    setAnnouncement(`Measurement ${measurementCount.current}: ${result}. ${repeated ? "Same state, same result." : `The outcome had a ${Math.round(priorProbability * 100)} percent chance. The state has collapsed to ${result}.`} Drag the qubit or reset to prepare another state.`);
  }

  function reset() {
    prepare(90);
    setAnnouncement("Reset. Zero and one each have a 50 percent chance.");
  }

  return (
    <div className="qubit-toy" data-dragging={dragging} data-measured={outcome !== null}>
      <div className="orb-stage">
        <span className="pole pole-zero" aria-hidden="true">|0⟩</span>
        <svg
          className="qubit-orb"
          viewBox="0 0 320 320"
          role="slider"
          tabIndex={0}
          aria-label="Qubit rotation angle"
          aria-describedby="qubit-instructions"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(controlAngle)}
          aria-valuetext={`${Math.round(controlAngle)} degrees. ${percentZero} percent chance of zero, ${100 - percentZero} percent chance of one`}
          onPointerDown={startDrag}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) movePointer(event);
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={() => setDragging(false)}
          onKeyDown={handleKey}
        >
          <g className="orb-axis">
            <path d="M160 18v284M16 160h288" />
          </g>
          <circle className="orb-body" cx="160" cy="160" r="133" />
          <g className="orb-scale" aria-hidden="true">
            {angleTicks.map((path, index) => <path key={index} d={path} />)}
          </g>
          <g className="orb-grid" aria-hidden="true">
            <ellipse cx="160" cy="160" rx="52" ry="133" />
            <ellipse className="orb-grid-secondary" cx="160" cy="160" rx="104" ry="133" />
            <ellipse cx="160" cy="160" rx="133" ry="44" />
          </g>
          {controlAngle > 0.5 && <path className="angle-arc" d={angleArc} aria-hidden="true" />}
          <g className="orb-vector" style={{ transform: `rotate(${angle - 90}deg)` }}>
            <path d="M160 160H293" />
            <circle className="vector-center" cx="160" cy="160" r="2.5" />
            <circle className="vector-handle" cx="293" cy="160" r="3.5" />
          </g>
        </svg>
        <span className="pole pole-one" aria-hidden="true">|1⟩</span>
        <span className="basis-label basis-minus" aria-hidden="true">|−⟩</span>
        <span className="basis-label basis-plus" aria-hidden="true">|+⟩</span>
      </div>

      <div className="qubit-inspector">
        <div className="state-math">
          <p className="angle-label">θ = {Math.round(controlAngle)}°</p>
          <p
            className="state-equation"
            aria-label={`State psi is approximately ${alphaText} times zero plus ${betaText} times one.`}
          >
            <span aria-hidden="true">|ψ⟩ ≈ <span>{alphaText.replace("-", "−")}</span>|0⟩ + <span>{betaText}</span>|1⟩</span>
          </p>
        </div>
        <div className="probabilities" aria-label="Measurement probabilities">
          <span>P(0) <span>{percentZero}%</span></span>
          <span>P(1) <span>{100 - percentZero}%</span></span>
        </div>

        <div className="toy-controls">
          <button className="measure-button" onClick={measure} type="button">measure</button>
          <button className="reset-button" onClick={reset} type="button" aria-label="Reset qubit" title="Reset qubit">
            reset
          </button>
        </div>
        <div className="measurement-readout">
          {measurement ? (
            <p className="measurement-result">
              {String(measurement.number).padStart(2, "0")} → |{measurement.result}⟩
              <span className="measurement-context">{measurement.repeated
                ? " · same state, same result"
                : ` · prior chance ${Math.round(measurement.probability * 100)}%`}</span>
            </p>
          ) : (
            <p className="play-hint">drag to rotate · measure to sample</p>
          )}
        </div>
        <details className="math-details">
          <summary>what is this?</summary>
          <div className="math-explanation">
            <p>This is a Bloch sphere: a map of a qubit’s state. The control explores its x–z slice, with a tick every 30°. The angle θ sets the amplitudes α and β.</p>
            <p className="general-equation">|ψ⟩ = α|0⟩ + β|1⟩<br />α = cos(θ/2) · β = sin(θ/2)</p>
            <p>Square the amplitudes for the odds: P(0) = |α|² and P(1) = |β|². At 90°, each amplitude is about 0.707, giving 50/50 odds.</p>
            <p>The horizontal states |+⟩ and |−⟩ both give 50/50 odds in this measurement basis; their relative signs differ.</p>
            <p>Measuring in the 0/1 basis returns one result and leaves the qubit in that state. Dragging prepares a different state; reset restores the 50/50 starting state.</p>
            <a href="https://quantum.cloud.ibm.com/learning/en/modules/quantum-mechanics/superposition-with-qiskit" target="_blank" rel="noreferrer">Explore superposition with IBM ↗</a>
          </div>
        </details>
        <nav className="social-links" aria-label="Quantum at Lehigh social media">
          <a href="https://x.com/qlehighu" target="_blank" rel="noopener noreferrer" aria-label="@qlehighu on X">x <ArrowIcon /></a>
          <a href="https://www.instagram.com/qlehighu/" target="_blank" rel="noopener noreferrer" aria-label="@qlehighu on Instagram">instagram <ArrowIcon /></a>
        </nav>
      </div>
      <p className="sr-only" id="qubit-instructions">
        Simulated qubit. Drag around the dial, or use arrow keys to change its state.
        Measure to collapse the state; reset to restore equal probabilities.
      </p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}
