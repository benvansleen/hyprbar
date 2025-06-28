import { Variable } from "astal";

const cpuTemp: Variable<number> = Variable(0).poll(
  1000,
  ["sensors", "-j"],
  (temp: string, _prev: number) => {
    return JSON.parse(temp)["k10temp-pci-00c3"]["Tctl"]["temp1_input"];
  },
);

const CRITICAL_TEMP = 89;
export default function CpuTemperature(): JSX.Element {
  const widget = Variable.derive([cpuTemp], (cpuTemp) => {
    return (
      <button className="dial">
        <label
          label={` ${cpuTemp.toFixed(0)}°C`}
          className={`dial-label ${cpuTemp > CRITICAL_TEMP ? "critical" : ""}`}
        />
      </button>
    );
  });

  return <>{widget()}</>;
}
