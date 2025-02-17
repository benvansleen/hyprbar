import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Workspaces from "./Workspaces";
import CpuHistogram from "./CpuHistogram";
import CpuTemperature from "./CpuTemperature";
import Ram from "./Ram";
import { Index } from "./types";

const time = Variable("").poll(1000, "date '+%-I:%M %p'");

type BarProps = {
  gdkmonitor: Gdk.Monitor;
  monitor_idx: Index;
};

function Left({ monitor_idx }: BarProps) {
  return (
    <>
      <Workspaces monitor_idx={monitor_idx} />
    </>
  );
}

function Center(_props: BarProps) {
  return <></>;
}

function Right(_props: BarProps) {
  return (
    <>
      <CpuHistogram />
      <CpuTemperature />
      <Ram />
      <button onClick={() => print("hello")} halign={Gtk.Align.END}>
        <label label={time()} />
      </button>
    </>
  );
}

export default function Bar(gdkmonitor: Gdk.Monitor, monitor_idx: Index) {
  const props = { gdkmonitor, monitor_idx };
  const is_primary = monitor_idx === 0;
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
        {is_primary ? (
          <>
            <box halign={Gtk.Align.START}>
              <Left {...props} />
            </box>
            <box halign={Gtk.Align.CENTER}>
              <Center {...props} />
            </box>
            <box halign={Gtk.Align.END}>
              <Right {...props} />
            </box>
          </>
        ) : (
          <>
            <box halign={Gtk.Align.START}>
              <Left {...props} />
            </box>
            <box halign={Gtk.Align.CENTER}></box>
            <box halign={Gtk.Align.END}></box>
          </>
        )}
      </centerbox>
    </window>
  );
}
