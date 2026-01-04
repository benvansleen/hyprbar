import { createBinding, createComputed } from "ags";
import AstalBattery from "gi://AstalBattery";

function batteryIcon(isCharging: boolean, pct: number): string {
  if (isCharging) return "󰂄";
  if (pct > 99) return "󰁹";
  if (pct > 80) return "󰂂";
  if (pct > 60) return "󰁿";
  if (pct > 40) return "󰁽";
  if (pct > 20) return "󰁻";
  return "󰂃";
}

const CRITICAL_POWER = 21;

export default function BatteryPct(): JSX.Element {
  const battery = AstalBattery.get_default();
  const percentage = createBinding(battery, "percentage");
  const charging = createBinding(battery, "charging");

  const state = createComputed((get) => {
    const pct = Math.floor(get(percentage) * 100);
    const isCharging = get(charging);
    return { pct, isCharging };
  });

  const label = state((s) => `${batteryIcon(s.isCharging, s.pct)} ${s.pct}%`);
  const cssClass = state((s) =>
    !s.isCharging && s.pct < CRITICAL_POWER ? "critical" : "",
  );

  return (
    <menubutton visible={createBinding(battery, "isPresent")}>
      <label label={label} class={cssClass} />
    </menubutton>
  );
}
