import { createComputed, createState } from "ags";
import { createPoll } from "ags/time";
import { exec } from "ags/process";
import Gtk from "gi://Gtk?version=4.0";

function brightnessIcon(brightness: number): string {
  if (brightness > 0.66) return "󰃠";
  if (brightness > 0.33) return "󰃟";
  return "󰃞";
}

function readBrightness(): number | null {
  try {
    const output = exec(["brightnessctl", "-c", "backlight", "-m"]);
    // Format: device,class,current,percentage%,max
    const parts = output.trim().split(",");
    if (parts.length >= 5) {
      const current = parseInt(parts[2], 10);
      const max = parseInt(parts[4], 10);
      return max > 0 ? current / max : 0;
    }
  } catch {
    // No backlight device available
  }
  return null;
}

function setBrightness(value: number): void {
  exec([
    "brightnessctl",
    "-c",
    "backlight",
    "set",
    `${Math.round(value * 100)}%`,
  ]);
}

export default function Brightness(): JSX.Element {
  const initialBrightness = readBrightness();

  // No backlight device available - don't render
  if (initialBrightness === null) {
    return <box />;
  }

  const [brightness, setBrightnessState] = createState(initialBrightness);
  const [expanded, setExpanded] = createState(false);

  // Poll to sync with external changes
  createPoll(null, 1000, () => {
    const value = readBrightness();
    if (value !== null) {
      setBrightnessState(value);
    }
  });

  const icon = brightness((b) => brightnessIcon(b));
  const pct = brightness((b) => String(Math.round(b * 100)));
  const label = createComputed((get) => `${get(icon)} ${get(pct)}%`);
  const cssClass = createComputed((get) => {
    const base = "brightness";
    const exp = get(expanded) ? " expanded" : "";
    return `${base}${exp}`;
  });

  const onBrightnessChange = (scale: Gtk.Scale): void => {
    const value = scale.get_value();
    setBrightnessState(value);
    setBrightness(value);
  };

  return (
    <box
      class={cssClass}
      hexpand={false}
      $={(self) => {
        const motionCtrl = new Gtk.EventControllerMotion();
        motionCtrl.connect("enter", () => setExpanded(true));
        motionCtrl.connect("leave", () => setExpanded(false));
        self.add_controller(motionCtrl);
      }}
    >
      <revealer
        revealChild={expanded}
        transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
        transitionDuration={150}
      >
        <Gtk.Scale
          class="brightness-slider"
          hexpand
          $={(self) => {
            self.set_range(0, 1);
            self.set_draw_value(false);
            self.set_value(initialBrightness);
          }}
          onChangeValue={(self) => onBrightnessChange(self)}
        />
      </revealer>
      <button class="brightness-label">
        <label label={label} width_chars={7} />
      </button>
    </box>
  );
}
