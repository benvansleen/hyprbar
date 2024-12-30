import { Variable } from "astal";

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

export default function CpuHistogram(): JSX.Element {
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
