import { createBinding } from "ags";
import Cava from "gi://AstalCava";
import Gtk from "gi://Gtk?version=4.0";

type HistogramBar = "▁" | "▂" | "▃" | "▄" | "▅" | "▆" | "▇" | "█";

function valueToBar(value: number): HistogramBar {
  // values are 0-1 (can overshoot slightly)
  const clamped = Math.min(1, Math.max(0, value));
  if (clamped < 0.125) return "▁";
  if (clamped < 0.25) return "▂";
  if (clamped < 0.375) return "▃";
  if (clamped < 0.5) return "▄";
  if (clamped < 0.625) return "▅";
  if (clamped < 0.75) return "▆";
  if (clamped < 0.875) return "▇";
  return "█";
}

const IDLE_THRESHOLD = 0.01;

function isAudioPlaying(vals: number[]): boolean {
  return vals.some((v) => v > IDLE_THRESHOLD);
}

export default function CavaVisualizer(): JSX.Element {
  const cava = Cava.get_default();

  // Configure cava
  cava.bars = 48;
  cava.framerate = 60;
  cava.autosens = true;
  cava.stereo = false;

  const values = createBinding(cava, "values");

  // Convert values array to histogram string
  const visualizer = values((vals: number[]) =>
    vals.map((v) => valueToBar(v)).join(""),
  );

  // Show/hide when audio starts/stops
  const playing = values((vals: number[]) => isAudioPlaying(vals));

  return (
    <revealer
      revealChild={playing}
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={300}
    >
      <box class="cava">
        <label label={visualizer} />
      </box>
    </revealer>
  );
}
