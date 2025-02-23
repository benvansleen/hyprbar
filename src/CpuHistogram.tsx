import { Variable } from "astal";
import { Index, Float } from "./types";

type MpStat = {
  sysstat?: {
    hosts: [
      {
        nodename: string;
        sysname: string;
        release: string;
        machine: string;
        "number-of-cpus": string;
        date: string;
        statistics: [
          {
            timestamp: string;
            "cpu-load": [
              {
                cpu: "all" | `${Index}`;
                usr: Float;
                nice: Float;
                sys: Float;
                iowait: Float;
                irq: Float;
                soft: Float;
                steal: Float;
                guest: Float;
                gnice: Float;
                idle: Float;
              },
            ];
          },
        ];
      },
    ];
  };
};

const cpus: Variable<MpStat> = Variable({}).poll(
  250,
  "mpstat -P ALL -o JSON 1 1",
  (out: string, _prev: MpStat) => JSON.parse(out),
);

type HistogramBar = "▁" | "▂" | "▃" | "▄" | "▅" | "▆" | "▇" | "█";
function loadToHistogramBar(load: number): HistogramBar {
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

export default function CpuHistogram(): JSX.Element {
  const widget = Variable.derive([cpus], (cpus) => {
    const loads = cpus.sysstat?.hosts[0].statistics[0]["cpu-load"]
      .filter(({ cpu }) => cpu !== "all")
      .map(({ usr }) => usr) ?? [0];

    return (
      <button>
        <box>
          <label label="󰍛 " className="cpu-icon" />
          {loads.map((load) => (
            <label
              className={load > 80 ? "critical" : ""}
              label={loadToHistogramBar(load)}
            />
          ))}
        </box>
      </button>
    );
  });

  return <>{widget()}</>;
}
