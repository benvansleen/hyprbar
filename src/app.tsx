import { createBinding, createComputed, For, This } from "ags";
import app from "ags/gtk4/app";
import style from "../style.scss";
import Bar from "./Bar";

app.start({
  css: style,
  main() {
    const monitors = createBinding(app, "monitors");
    const monitorsWithPrimary = createComputed((get) => {
      const ms = get(monitors);
      if (ms.length === 1) return [{ monitor: ms[0], primary: true }];

      let primaryFound = false;
      return ms.map((monitor) => ({
        monitor,
        primary:
          !primaryFound && monitor.geometry.width >= monitor.geometry.height,
      }));
    });

    return (
      <For each={monitorsWithPrimary}>
        {(monitor) => (
          <This this={app}>
            <Bar gdkmonitor={monitor.monitor} primary={monitor.primary} />
          </This>
        )}
      </For>
    );
  },
});
