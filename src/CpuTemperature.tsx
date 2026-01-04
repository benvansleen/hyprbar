import { createPoll } from "ags/time";

const cpuTemp = createPoll(0, 1000, ["sensors", "-j"], (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);

    const amdTemp = data["k10temp-pci-00c3"]?.["Tctl"]?.["temp1_input"];
    const intelTemp =
      data["coretemp-isa-0000"]?.["Package id 0"]?.["temp1_input"];

    return amdTemp || intelTemp || 0;
  } catch {
    return 0;
  }
});

export default function CpuTemperature(): JSX.Element {
  const visible = cpuTemp((temp) => temp !== 0);
  const label = cpuTemp((temp) => ` ${temp.toFixed(0)}°C`);
  const cssClass = cpuTemp(
    (temp) => `dial-label ${temp > 89 ? "critical" : ""}`,
  );

  return (
    <menubutton class="dial" visible={visible}>
      <label label={label} class={cssClass} />
    </menubutton>
  );
}
