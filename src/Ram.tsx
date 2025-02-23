import { Variable } from "astal";

type Rational = { denominator: number; numerator: number };
const ramUsage: Variable<Rational> = Variable({
  numerator: 0,
  denominator: 1,
}).poll(1000, ["cat", "/proc/meminfo"], (meminfo: string, _prev: Rational) => {
  var [_1, total] = meminfo.match(/MemTotal:\s+(\d+)\s+kB/) ?? [0, 0];
  const [_2, available] = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/) ?? [0, 0];

  total = Number(total);
  const used = total - Number(available);
  return { numerator: used, denominator: total };
});

const CRITICAL_RAM = 0.8;
export default function Ram(): JSX.Element {
  const widget = Variable.derive(
    [ramUsage],
    ({ denominator: total, numerator: used }) => {
      const pct = used / total;
      return (
        <button className="dial">
          <label
            label={`  ${(pct * 100).toFixed(0)}%`}
            className={`dial-label ${pct > CRITICAL_RAM ? "critical" : ""}`}
          />
        </button>
      );
    },
  );

  return <>{widget()}</>;
}
