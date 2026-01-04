import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import Workspaces from "./Workspaces";
import BatteryPct from "./Battery";
import CpuHistogram from "./CpuHistogram";
import CpuTemperature from "./CpuTemperature";
import Ram from "./Ram";

function Left({ connector }: { connector: string }): JSX.Element {
  return <Workspaces connector={connector} />;
}

function Right(): JSX.Element {
  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format("%-I:%M %p")!;
  });

  return (
    <>
      <CpuHistogram />
      <CpuTemperature />
      <Ram />
      <BatteryPct />
      <menubutton>
        <label label={time} />
        <popover>
          <Gtk.Calendar />
        </popover>
      </menubutton>
    </>
  );
}

export default function Bar({
  gdkmonitor,
  primary,
}: {
  gdkmonitor: Gdk.Monitor;
  primary: boolean;
}): JSX.Element {
  let win: Astal.Window;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  onCleanup(() => {
    win.destroy();
  });

  return (
    <window
      class="Bar"
      $={(self) => (win = self)}
      visible
      namespace="hyprbar"
      name={`bar-${gdkmonitor.connector}`}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={BOTTOM | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box $type="start">
          <Left connector={gdkmonitor.connector} />
        </box>
        {primary ? (
          <box $type="end">
            <Right />
          </box>
        ) : (
          <></>
        )}
      </centerbox>
    </window>
  );
}
