import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Workspaces from "./Workspaces";
import CpuHistogram from "./CpuHistogram";

const time = Variable("").poll(1000, "date");

export default function Bar(gdkmonitor: Gdk.Monitor) {
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
        <Workspaces />
        <button onClicked="echo hello" halign={Gtk.Align.CENTER}>
          <CpuHistogram />
        </button>
        <button onClick={() => print("hello")} halign={Gtk.Align.CENTER}>
          <label label={time()} />
        </button>
      </centerbox>
    </window>
  );
}
