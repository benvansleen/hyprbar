import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Workspaces from "./Workspaces";
import CpuHistogram from "./CpuHistogram";
import { Index } from "./types";

const time = Variable("").poll(1000, "date '+%-I:%M %p'");

type BarProps = {
  gdkmonitor: Gdk.Monitor;
  monitor_idx: Index;
};

function Left({ monitor_idx }: BarProps) {
  return (
    <box halign={Gtk.Align.START}>
      <Workspaces monitor_idx={monitor_idx} />
    </box>
  );
}

function Center(_props: BarProps) {
  return (
    <box halign={Gtk.Align.CENTER}>
      <CpuHistogram />
    </box>
  );
}

function Right(_props: BarProps) {
  return (
    <box halign={Gtk.Align.END}>
      <button onClick={() => print("hello")} halign={Gtk.Align.END}>
        <label label={time()} />
      </button>
    </box>
  );
}

export default function Bar(gdkmonitor: Gdk.Monitor, monitor_idx: Index) {
  const props = { gdkmonitor, monitor_idx };
  return (
    <window
      className="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={
        Astal.WindowAnchor.BOTTOM |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      application={App}
    >
      <centerbox>
        <Left {...props} />
        <Center {...props} />
        <Right {...props} />
      </centerbox>
    </window>
  );
}
