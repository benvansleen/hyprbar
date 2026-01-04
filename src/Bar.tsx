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

function Right() {
  // const time = createPoll("", 1000, ["date", "+%-I:%M %p"])
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

// export default function Bar(gdkmonitor: Gdk.Monitor, monitor_idx: Index) {
export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  let win: Astal.Window;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  // const props = { gdkmonitor, monitor_idx };
  // const is_primary = monitor_idx === 0;

  onCleanup(() => {
    // Root components (windows) are not automatically destroyed.
    // When the monitor is disconnected from the system, this callback
    // is run from the parent <For> which allows us to destroy the window
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
        <box $type="end">
          <Right />
        </box>
      </centerbox>

      {/* <centerbox> */}
      {/*   <box halign={Gtk.Align.START}> */}
      {/*     <Left /> */}
      {/*   </box> */}
      {/*   <box halign={Gtk.Align.CENTER}> */}
      {/*     <Center /> */}
      {/*   </box> */}
      {/*   <box halign={Gtk.Align.END}> */}
      {/*     <Right /> */}
      {/*   </box> */}

      {/* {is_primary ? ( */}
      {/*   <> */}
      {/*     <box halign={Gtk.Align.START}> */}
      {/*       <Left {...props} /> */}
      {/*     </box> */}
      {/*     <box halign={Gtk.Align.CENTER}> */}
      {/*       <Center {...props} /> */}
      {/*     </box> */}
      {/*     <box halign={Gtk.Align.END}> */}
      {/*       <Right {...props} /> */}
      {/*     </box> */}
      {/*   </> */}
      {/* ) : ( */}
      {/*   <> */}
      {/*     <box halign={Gtk.Align.START}> */}
      {/*       <Left {...props} /> */}
      {/*     </box> */}
      {/*     <box halign={Gtk.Align.CENTER}></box> */}
      {/*     <box halign={Gtk.Align.END}></box> */}
      {/*   </> */}
      {/* )} */}
      {/* </centerbox> */}
    </window>
  );
}

// export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
//   let win: Astal.Window
//   const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
//
//   onCleanup(() => {
//     // Root components (windows) are not automatically destroyed.
//     // When the monitor is disconnected from the system, this callback
//     // is run from the parent <For> which allows us to destroy the window
//     win.destroy()
//   })
//
//   return (
//     <window
//       $={(self) => (win = self)}
//       visible
//       namespace="my-bar"
//       name={`bar-${gdkmonitor.connector}`}
//       gdkmonitor={gdkmonitor}
//       exclusivity={Astal.Exclusivity.EXCLUSIVE}
//       anchor={TOP | LEFT | RIGHT}
//       application={app}
//     >
//       {/* <centerbox> */}
//       {/*   <box $type="start"> */}
//       {/*     <Clock /> */}
//       {/*     <Mpris /> */}
//       {/*   </box> */}
//       {/*   <box $type="end"> */}
//       {/*     <Tray /> */}
//       {/*     <Wireless /> */}
//       {/*     <AudioOutput /> */}
//       {/*     <Battery /> */}
//       {/*   </box> */}
//       {/* </centerbox> */}
//     </window>
//   )
// }
