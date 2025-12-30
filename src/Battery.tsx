import { Variable } from "astal";
import { exec } from "astal";

const BATTERY = "/sys/class/power_supply/BAT0";

const hasBattery =
  exec(`bash -c 'test -d ${BATTERY} && echo true || echo false'`) === "true";

const batteryPct = hasBattery
  ? Variable(0).poll(
      1000,
      ["cat", `${BATTERY}/capacity`],
      (pct: string, _prev: number) => {
        return Number.parseInt(pct);
      },
    )
  : null;

const batteryCharging = hasBattery
  ? Variable(false).poll(
      1000,
      ["cat", `${BATTERY}/status`],
      (status: string, _prev: boolean) => {
        return status === "Charging";
      },
    )
  : null;

function batteryIcon(batteryCharging: boolean, batteryPct: number): string {
  if (batteryCharging) {
    return "󰂄";
  }

  if (batteryPct > 99) {
    return "󰁹";
  } else if (batteryPct > 80) {
    return "󰂂";
  } else if (batteryPct > 60) {
    return "󰁿";
  } else if (batteryPct > 40) {
    return "󰁽";
  } else if (batteryPct > 20) {
    return "󰁻";
  } else {
    return "󰂃";
  }
}

const CRITICAL_POWER = 21;
export default function BatteryPct(): JSX.Element {
  if (!hasBattery || !batteryPct || !batteryCharging) {
    return <box visible={false} />;
  }

  const widget = Variable.derive(
    [batteryPct, batteryCharging],
    (batteryPct, batteryCharging) => {
      return (
        <button className="dial">
          <label
            label={`${batteryIcon(batteryCharging, batteryPct)} ${batteryPct}%`}
            className={`dial-label ${batteryPct < CRITICAL_POWER ? "critical" : ""}`}
          />
        </button>
      );
    },
  );

  return <>{widget()}</>;
}
