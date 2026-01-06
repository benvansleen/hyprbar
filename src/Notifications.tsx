import { createBinding, For } from "ags";
import Notifd from "gi://AstalNotifd";
import Gtk from "gi://Gtk?version=4.0";

function urgencyClass(urgency: Notifd.Urgency): string {
  switch (urgency) {
    case Notifd.Urgency.LOW:
      return "low";
    case Notifd.Urgency.CRITICAL:
      return "critical";
    default:
      return "normal";
  }
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notifd.Notification;
  onDismiss: () => void;
}): JSX.Element {
  const urgency = urgencyClass(notification.urgency);

  return (
    <box class={`notification-item ${urgency}`}>
      <box orientation={Gtk.Orientation.VERTICAL} hexpand>
        <box class="notification-header">
          <label class="notification-app" label={notification.appName || ""} />
          <box hexpand />
          <button
            class="notification-dismiss"
            onClicked={() => {
              onDismiss();
              notification.dismiss();
            }}
          >
            <label label="󰅖" />
          </button>
        </box>
        <label
          class="notification-summary"
          label={notification.summary}
          xalign={0}
          wrap
        />
        {notification.body ? (
          <label
            class="notification-body"
            label={notification.body}
            xalign={0}
            wrap
          />
        ) : (
          <box />
        )}
      </box>
    </box>
  );
}

export default function Notifications(): JSX.Element {
  const notifd = Notifd.get_default();
  const notifications = createBinding(notifd, "notifications");

  const hasNotifications = notifications((list) => list.length > 0);
  const label = notifications((list) =>
    list.length > 0 ? `󱅫 ${list.length}` : "",
  );

  let popoverRef: Gtk.Popover;
  let revealerRef: Gtk.Revealer;
  let scrollRef: Gtk.ScrolledWindow;
  let buttonHovered = false;
  let popoverHovered = false;
  let dismissing = false;
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;

  const cancelClose = (): void => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  };

  const scheduleClose = (): void => {
    if (dismissing) return;
    cancelClose();
    revealerRef?.set_reveal_child(false);
    closeTimeout = setTimeout(() => {
      popoverRef?.popdown();
      closeTimeout = null;
    }, 150);
  };

  const forceClose = (): void => {
    dismissing = false;
    cancelClose();
    popoverHovered = false;
    buttonHovered = false;
    revealerRef?.set_reveal_child(false);
    popoverRef?.popdown();
  };

  const updatePopover = (): void => {
    if (dismissing) return;
    if (buttonHovered || popoverHovered) {
      cancelClose();
      popoverRef?.popup();
      revealerRef?.set_reveal_child(true);
    } else {
      scheduleClose();
    }
  };

  const keepOpen = (): void => {
    // Block all close attempts during dismiss
    dismissing = true;
    cancelClose();
    popoverHovered = true;

    // Lock the current height to prevent shrinking
    if (scrollRef) {
      const currentHeight = scrollRef.get_allocated_height();
      if (currentHeight > 0) {
        scrollRef.set_min_content_height(currentHeight);
      }
    }

    // Re-enable normal behavior after DOM settles
    setTimeout(() => {
      dismissing = false;
      // Reset min height to allow natural sizing
      if (scrollRef) {
        scrollRef.set_min_content_height(0);
      }
      // If no notifications left, close the popover
      if (notifd.get_notifications().length === 0) {
        forceClose();
      }
    }, 100);
  };

  return (
    <box
      class="notifications"
      visible={hasNotifications}
      hexpand={false}
      $={(self) => {
        const motionCtrl = new Gtk.EventControllerMotion();
        motionCtrl.connect("enter", () => {
          buttonHovered = true;
          updatePopover();
        });
        motionCtrl.connect("leave", () => {
          buttonHovered = false;
          // Small delay to allow mouse to reach popover
          setTimeout(updatePopover, 100);
        });
        self.add_controller(motionCtrl);
      }}
    >
      <menubutton class="notifications-button">
        <label label={label} />
        <popover
          class="notifications-popover"
          autohide={false}
          $={(self) => {
            popoverRef = self;
            self.set_can_focus(false);

            // Track hover on popover itself
            const popoverMotion = new Gtk.EventControllerMotion();
            popoverMotion.connect("enter", () => {
              popoverHovered = true;
              updatePopover();
            });
            popoverMotion.connect("leave", () => {
              popoverHovered = false;
              setTimeout(updatePopover, 100);
            });
            self.add_controller(popoverMotion);
          }}
        >
          <revealer
            revealChild={false}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={150}
            $={(self) => {
              revealerRef = self;
            }}
          >
            <box
              orientation={Gtk.Orientation.VERTICAL}
              class="notifications-list"
            >
              <box class="notifications-list-header">
                <label class="notifications-title" label="Notifications" />
                <box hexpand />
                <button
                  class="notifications-clear"
                  onClicked={() => {
                    const list = notifd.get_notifications();
                    for (const n of list) {
                      n.dismiss();
                    }
                    forceClose();
                  }}
                >
                  <label label="Clear All" />
                </button>
              </box>
              <Gtk.Separator />
              <Gtk.ScrolledWindow
                class="notifications-scroll"
                vexpand
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                $={(self) => {
                  scrollRef = self;
                  self.set_max_content_height(400);
                  self.set_propagate_natural_height(true);
                }}
              >
                <box
                  orientation={Gtk.Orientation.VERTICAL}
                  class="notifications-items"
                >
                  <For
                    each={notifications((list) =>
                      [...list].sort((a, b) => b.time - a.time),
                    )}
                  >
                    {(n: Notifd.Notification) => (
                      <NotificationItem notification={n} onDismiss={keepOpen} />
                    )}
                  </For>
                </box>
              </Gtk.ScrolledWindow>
            </box>
          </revealer>
        </popover>
      </menubutton>
    </box>
  );
}
