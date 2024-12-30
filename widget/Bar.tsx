import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { bind, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";

const time = Variable("").poll(1000, "date");

const hyprland = Hyprland.get_default();

function Workspaces(): JSX.Element {
  const workspaces = Variable.derive(
    [
      bind(hyprland, "workspaces"),
      bind(hyprland, "focusedWorkspace"),
      bind(hyprland, "focusedClient"),
    ],
    (workspaces, focusedWorkspace, focusedClient) => {
      print(workspaces.map((ws) => ws.get_name()).join(", "));

      const workspace_buttons = workspaces
        .sort((a, b) => a.id - b.id)
        .filter((ws) => !ws.get_name()?.startsWith("special"))
        .map((ws) => {
          return (
            <button
              onClick={() => ws.focus()}
              className={ws.id === focusedWorkspace.id ? "focused" : ""}
            >
              <label label={ws.get_name() ?? ""} />
            </button>
          );
        });

      return (
        <box>
          {workspace_buttons}

          {focusedClient ? (
            <button>
              <label label={focusedClient.get_initial_class()} />
            </button>
          ) : (
            <box />
          )}
        </box>
      );
    },
  );

  return <box>{workspaces()}</box>;
}

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
          Welcome to AGS!
        </button>
        <button onClick={() => print("hello")} halign={Gtk.Align.CENTER}>
          <label label={time()} />
        </button>
      </centerbox>
    </window>
  );
}
