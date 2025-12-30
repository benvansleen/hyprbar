import { Variable } from "astal";

const cpuTemp = Variable(0).poll(
  1000,
  ["sensors", "-j"],
  (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);

      const amdTemp = data["k10temp-pci-00c3"]?.["Tctl"]?.["temp1_input"];
      const intelTemp =
        data["coretemp-isa-0000"]?.["Package id 0"]?.["temp1_input"];

      return amdTemp || intelTemp || 0;
    } catch {
      return 0;
    }
  },
);

export default function CpuTemperature(): JSX.Element {
  const widget = Variable.derive([cpuTemp], (temp) => {
    // If temp is 0, it means no sensor was found; hide the widget
    if (temp === 0) {
      return <box visible={false} />;
    }

    return (
      <button className="dial">
        <label
          label={` ${temp.toFixed(0)}°C`}
          className={`dial-label ${temp > 89 ? "critical" : ""}`}
        />
      </button>
    );
  });

  return <>{widget()}</>;
}
