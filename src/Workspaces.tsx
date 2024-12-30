import { bind, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";

const hyprland = Hyprland.get_default();

export default function Workspaces(): JSX.Element {
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
