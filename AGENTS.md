# AGENTS.md

## Build Commands

- `nix build` - Build the package
- `nix run .#watch` - Development mode with hot reload
- `nix flake check` - Run pre-commit hooks (prettier, deadnix, nixfmt-rfc-style)
- `nix develop` - Enter development shell

## Code Style

### TypeScript/TSX

- Strict mode enabled; explicit `JSX.Element` return types for components
- Named imports: `import { createBinding, For } from "ags"`
- GObject imports: `import Gdk from "gi://Gdk?version=4.0"`
- Components: PascalCase (`BatteryPct`, `CpuHistogram`)
- Variables: camelCase; Constants: SCREAMING_SNAKE_CASE
- Props destructured in signature: `function Foo({ prop }: { prop: Type })`
- Use `createPoll()` for async data polling, `createBinding()` for GObject property bindings
- Use `<For each={list}>` for dynamic lists, `<With value={val}>` for conditional rendering
- JSX props: `class` (not className), `$` for setup/ref callbacks, `onClicked` (not onClick)
- Error handling: try-catch with fallback values, conditional rendering for missing data

### SCSS

- Use GTK Adwaita variables (`$theme_fg_color`, `$theme_bg_color`)
- CSS classes: kebab-case (`dial-label`); state classes: camelCase (`focused`)

### Nix

- Use nixfmt-rfc-style formatting

## AGS v3 Tips & Patterns

### Reactive State

- Transform accessors inline: `myAccessor((val) => transformedVal)` - creates derived binding
- Combine multiple bindings with `createComputed((get) => { get(binding1); get(binding2); ... })`
- To trigger reactivity, you must `get()` a binding even if you don't use its value directly

### Dynamic Rendering

- `<For each={list}>` recreates children when list identity changes; use stable keys (IDs, not objects)
- Avoid `<With>` returning conditionals - causes "nesting Fragments not supported" error
- Wrap `<For>` in its own `<box>` when mixing with static siblings to prevent reordering bugs

### GTK/Styling Gotchas

- Buttons have default min-height/min-width; use `min-height: 0; min-width: 0` to override
- Prefer `<menubutton>` for non-interactive styled containers, `<button>` for clickable elements
- Use `visible={condition}` instead of conditional rendering to avoid Fragment issues

### Astal Libraries

- Use Astal libraries when available (e.g., `AstalBattery`, `AstalHyprland`) instead of shell commands
- Match Gdk.Monitor to Hyprland monitor via `connector` property (e.g., "DP-1", "HDMI-A-1")
- To add a new Astal library, add it to `astalPackages` in `nix/package.nix` (e.g., `wireplumber` for audio)
- Import pattern: `import Wp from "gi://AstalWp"` then `Wp.get_default()?.audio.defaultSpeaker`

### GTK4 Widget Usage

- **Intrinsic elements**: AGS provides lowercase intrinsic elements for common widgets: `<box>`, `<label>`, `<button>`, `<menubutton>`, `<revealer>`, `<popover>`, `<centerbox>`, `<window>`
- **GTK4 widgets not in AGS**: Use the class directly: `<Gtk.Scale>`, `<Gtk.Calendar>`, etc.
- **Unknown intrinsic error**: If you see `unknown intrinsic element "foo"`, use `<Gtk.Foo>` instead

### GTK4 Event Handling

- **Click events**: Use `onClicked` for buttons (works on `<button>`)
- **Hover events**: GTK4 boxes do NOT have `onHoverEnter`/`onHoverLeave` signals. Use `Gtk.EventControllerMotion`:
  ```tsx
  <box
    $={(self) => {
      const motionCtrl = new Gtk.EventControllerMotion();
      motionCtrl.connect("enter", () => /* hover enter */);
      motionCtrl.connect("leave", () => /* hover leave */);
      self.add_controller(motionCtrl);
    }}
  >
  ```
- **Value change events**: For `<Gtk.Scale>`, use `onChangeValue={(self) => self.get_value()}`

### GTK4 Scale Widget

Scales require manual setup via the `$` callback since they don't have simple JSX props:

```tsx
<Gtk.Scale
  $={(self) => {
    self.set_range(0, 1); // min, max
    self.set_draw_value(false); // hide the value label
    self.set_value(initialValue); // set initial value
    // To bind reactively, connect to your data source:
    speaker.connect("notify::volume", () => self.set_value(speaker.volume));
  }}
  onChangeValue={(self) => {
    speaker.volume = self.get_value();
  }}
/>
```

### Layout Tips

- **Prevent box expansion**: Use `hexpand={false}` to stop a box from filling available horizontal space
- **Revealer for show/hide animations**: Use `<revealer revealChild={boolean} transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}>` for animated expand/collapse
- **Local component state**: Use `createState()` for UI state like hover/expanded: `const [expanded, setExpanded] = createState(false)`

### Nix + Git Gotcha

- **New files must be git-tracked**: Nix only sees files tracked by git. If you create a new `.tsx` file and `nix build` fails with "Could not resolve", run `git add <file>` first
