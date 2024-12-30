import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { bind, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";

interface ICpuLoad {
  cpu: string;
  usr: number;
  nice: number;
  sys: number;
  iowait: number;
  irq: number;
  soft: number;
  steal: number;
  guest: number;
  gnice: number;
  idle: number;
}
interface IStatistic {
  timestamp: string;
  "cpu-load": [ICpuLoad];
}
interface IHost {
  nodename: string;
  sysname: string;
  release: string;
  machine: string;
  "number-of-cpus": string;
  date: string;
  statistics: [IStatistic];
}
interface ISysstat {
  hosts: [IHost];
}
interface IMPstat {
  sysstat?: ISysstat;
}

const cpus: Variable<IMPstat> = Variable({}).poll(
  1100,
  "mpstat -P ALL -o JSON 1 1",
  (out: string, _prev: IMPstat) => JSON.parse(out),
);

function loadToHistogramBar(load: number) {
  return load < 10
    ? "▁"
    : load < 20
      ? "▂"
      : load < 30
        ? "▃"
        : load < 40
          ? "▄"
          : load < 50
            ? "▅"
            : load < 60
              ? "▆"
              : load < 70
                ? "▇"
                : load < 80
                  ? "█"
                  : load < 90
                    ? "█"
                    : load < 100
                      ? "█"
                      : "█";
}
function Cpu(): JSX.Element {
  const widget = Variable.derive([cpus], (cpus) => {
    const loads = cpus.sysstat?.hosts[0].statistics[0]["cpu-load"]
      .filter(({ cpu }) => cpu !== "all")
      .map(({ usr }) => usr) ?? [0];

    return (
      <>
        {loads.map((load) => (
          <label
            className={load > 80 ? "critical" : ""}
            label={loadToHistogramBar(load)}
          />
        ))}
      </>
    );
  });

  return <box>{widget()}</box>;
}

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
          <Cpu />
        </button>
        <button onClick={() => print("hello")} halign={Gtk.Align.CENTER}>
          <label label={time()} />
        </button>
      </centerbox>
    </window>
  );
}
