import { createBinding, createComputed, For } from "ags";
import Hyprland from "gi://AstalHyprland";

const hyprland = Hyprland.get_default();

type WorkspacesProps = {
  connector: string;
};

export default function Workspaces({
  connector,
}: WorkspacesProps): JSX.Element {
  const workspaces = createBinding(hyprland, "workspaces");
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
  const focusedClient = createBinding(hyprland, "focusedClient");
  const clients = createBinding(hyprland, "clients");
  const monitors = createBinding(hyprland, "monitors");

  const monitor = createComputed((get) => {
    const allMonitors = get(monitors);
    return allMonitors.find((m) => m.get_name() === connector) ?? null;
  });

  const monitorWorkspaceIds = createComputed((get) => {
    const allWorkspaces = get(workspaces);
    const mon = get(monitor);
    if (!mon) return [];

    return allWorkspaces
      .sort((a, b) => a.id - b.id)
      .filter(
        (ws) =>
          !ws.get_name()?.startsWith("special") &&
          ws.get_monitor().get_name() === mon.get_name(),
      )
      .map((ws) => ws.id);
  });

  const activeWorkspaceId = createComputed((get) => {
    get(focusedWorkspace);
    const mon = get(monitor);
    return mon?.get_active_workspace()?.id ?? -1;
  });

  const focusedClientOnMonitor = createComputed((get) => {
    // subscribe to all relevant signals that might indicate client focus change
    get(clients);
    const client = get(focusedClient);
    const mon = get(monitor);
    if (!client || !mon) return null;
    return client.get_monitor()?.get_name() === mon.get_name() ? client : null;
  });

  return (
    <box>
      <box>
        <For each={monitorWorkspaceIds}>
          {(id) => (
            <WorkspaceButton wsId={id} activeWorkspaceId={activeWorkspaceId} />
          )}
        </For>
      </box>
      <FocusedClient client={focusedClientOnMonitor} />
    </box>
  );
}

function WorkspaceButton({
  wsId,
  activeWorkspaceId,
}: {
  wsId: number;
  activeWorkspaceId: ReturnType<typeof createComputed<number>>;
}): JSX.Element {
  const ws = hyprland.get_workspace(wsId);
  const cssClass = activeWorkspaceId((id) => (id === wsId ? "focused" : ""));

  return (
    <button
      onClicked={() => ws?.focus()}
      class={cssClass((c) => `workspace-button ${c}`)}
    >
      <label label={ws?.get_name() ?? ""} />
    </button>
  );
}

function FocusedClient({
  client,
}: {
  client: ReturnType<typeof createComputed<Hyprland.Client | null>>;
}): JSX.Element {
  const visible = client((c) => c !== null);
  const label = client((c) => (c ? renderClassname(c.get_class()) : ""));

  return (
    <menubutton class="focusedClient" visible={visible}>
      <label label={label} />
    </menubutton>
  );
}

function renderClassname(classname: string): string {
  if (classname === "floorp" || classname === "firefox") {
    return "  Browser";
  } else if (classname.endsWith("ghostty")) {
    return "󰊠  Ghostty";
  } else if (classname === "emacs") {
    return " Emacs";
  } else if (classname === "neovide") {
    return " Neovim";
  } else {
    return classname;
  }
}
