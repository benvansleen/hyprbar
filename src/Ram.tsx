import { createPoll } from "ags/time";

type Rational = { denominator: number; numerator: number };

const ramUsage = createPoll(
  { numerator: 0, denominator: 1 } as Rational,
  1000,
  ["cat", "/proc/meminfo"],
  (meminfo: string) => {
    const [, total] = meminfo.match(/MemTotal:\s+(\d+)\s+kB/) ?? [0, 0];
    const [, available] = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/) ?? [0, 0];

    const totalNum = Number(total);
    const used = totalNum - Number(available);
    return { numerator: used, denominator: totalNum };
  },
);

const CRITICAL_RAM = 0.8;

export default function Ram(): JSX.Element {
  const label = ramUsage(({ numerator, denominator }) => {
    const pct = numerator / denominator;
    return ` ${(pct * 100).toFixed(0)}%`;
  });
  const cssClass = ramUsage(({ numerator, denominator }) => {
    const pct = numerator / denominator;
    return `dial-label ${pct > CRITICAL_RAM ? "critical" : ""}`;
  });

  return (
    <menubutton class="dial">
      <label label={label} class={cssClass} />
    </menubutton>
  );
}
