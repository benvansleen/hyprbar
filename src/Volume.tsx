import { createBinding, createComputed, createState } from "ags";
import Wp from "gi://AstalWp";
import Gtk from "gi://Gtk?version=4.0";

function volumeIcon(volume: number, muted: boolean): string {
  if (muted) return "󰝟";
  if (volume > 0.66) return "󰕾";
  if (volume > 0.33) return "󰖀";
  if (volume > 0) return "󰕿";
  return "󰝟";
}

export default function Volume(): JSX.Element {
  const wp = Wp.get_default();
  const speaker = wp?.audio.defaultSpeaker;

  if (!speaker) {
    return <box />;
  }

  const volume = createBinding(speaker, "volume");
  const muted = createBinding(speaker, "mute");

  const [expanded, setExpanded] = createState(false);

  const state = createComputed((get) => ({
    volume: get(volume),
    muted: get(muted),
  }));

  const icon = state((s) => volumeIcon(s.volume, s.muted));
  const pct = state((s) => String(Math.round(s.volume * 100)));
  const label = createComputed((get) => `${get(icon)} ${get(pct)}%`);
  const cssClass = createComputed((get) => {
    const base = "volume";
    const exp = get(expanded) ? " expanded" : "";
    const mut = get(muted) ? " muted" : "";
    return `${base}${exp}${mut}`;
  });

  const toggleMute = (): void => {
    speaker.mute = !speaker.mute;
  };

  const onVolumeChange = (scale: Gtk.Scale): void => {
    speaker.volume = scale.get_value();
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
          class="volume-slider"
          hexpand
          $={(self) => {
            self.set_range(0, 1);
            self.set_draw_value(false);
            const update = (): void => {
              self.set_value(speaker.volume);
            };
            update();
            speaker.connect("notify::volume", update);
          }}
          onChangeValue={(self) => onVolumeChange(self)}
        />
      </revealer>
      <button class="volume-button" onClicked={toggleMute}>
        <label label={label} width_chars={7} />
      </button>
    </box>
  );
}
