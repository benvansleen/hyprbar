import { For } from "ags";
import { createPoll } from "ags/time";
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

const cpuLoads = createPoll(
  [] as number[],
  250,
  ["bash", "-c", "mpstat -P ALL -o JSON 1 1"],
  (out: string) => {
    try {
      const data: MpStat = JSON.parse(out);
      return (
        data.sysstat?.hosts[0].statistics[0]["cpu-load"]
          .filter(({ cpu }) => cpu !== "all")
          .map(({ usr }) => usr) ?? []
      );
    } catch {
      return [];
    }
  },
);

type HistogramBar = "▁" | "▂" | "▃" | "▄" | "▅" | "▆" | "▇" | "█";
function loadToHistogramBar(load: number): HistogramBar {
  if (load < 10) return "▁";
  if (load < 20) return "▂";
  if (load < 30) return "▃";
  if (load < 40) return "▄";
  if (load < 50) return "▅";
  if (load < 60) return "▆";
  if (load < 70) return "▇";
  return "█";
}

function CpuBar({ index }: { index: number }): JSX.Element {
  const label = cpuLoads((loads) => loadToHistogramBar(loads[index] ?? 0));
  const cssClass = cpuLoads((loads) =>
    (loads[index] ?? 0) > 80 ? "critical" : "",
  );

  return <label label={label} class={cssClass} />;
}

export default function CpuHistogram(): JSX.Element {
  const coreIndices = cpuLoads((loads) => loads.map((_, i) => i));

  return (
    <menubutton>
      <box>
        <label label="󰍛 " class="cpu-icon" />
        <For each={coreIndices}>{(index) => <CpuBar index={index} />}</For>
      </box>
    </menubutton>
  );
}
