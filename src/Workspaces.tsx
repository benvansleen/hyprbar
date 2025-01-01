import { bind, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import { Index } from "./types";

const hyprland = Hyprland.get_default();

type WorkspacesProps = {
  monitor_idx: Index;
};

export default function Workspaces({
  monitor_idx,
}: WorkspacesProps): JSX.Element {
  const workspaces = Variable.derive(
    [
      bind(hyprland, "workspaces"),
      bind(hyprland, "focusedWorkspace"),
      bind(hyprland, "focusedClient"),
      bind(hyprland, "monitors"),
    ],
    (workspaces, _focusedWorkspace, focusedClient, monitors) => {
      const monitor = monitors.reverse()[monitor_idx];
      const monitorActiveWorkspace = monitor.get_active_workspace();
      const workspace_buttons = workspaces
        .sort((a, b) => a.id - b.id)
        .filter(
          (ws) =>
            !ws.get_name()?.startsWith("special") &&
            ws.get_monitor().get_name() == monitor.get_name(),
        )
        .map((ws) => {
          return (
            <button
              onClick={() => ws.focus()}
              className={ws.id === monitorActiveWorkspace.id ? "focused" : ""}
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
              <label
                label={monitorActiveWorkspace
                  .get_last_client()
                  .get_initial_class()}
              />
            </button>
          ) : (
            <box />
          )}
        </box>
      );
    },
  );

  return <>{workspaces()}</>;
}
