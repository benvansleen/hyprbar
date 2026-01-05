import { createState } from "ags";
import { createPoll } from "ags/time";
import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";

export default function DateTime(): JSX.Element {
  const [expanded, setExpanded] = createState(false);

  // Time: "3:45 PM"
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format("%-I:%M %p")!;
  });

  // Full date: "Sunday, January 4, 2025"
  const fullDate = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format("%A, %B %-d, %Y")!;
  });

  return (
    <box
      class="datetime"
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
        <label label={fullDate} class="datetime-date" />
      </revealer>
      <menubutton>
        <label label={time} class="datetime-time" />
        <popover>
          <Gtk.Calendar />
        </popover>
      </menubutton>
    </box>
  );
}
