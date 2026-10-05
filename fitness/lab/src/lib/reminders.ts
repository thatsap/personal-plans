import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { addDaysKey, todayKey } from "./dates";
import { BREAKFAST, DINNER, LUNCH, type ReminderLine } from "./reminderCopy";

const CHANNEL = "fuel";
const ID_BASE = 7000;
const DAYS = 21;

const SLOTS: { hour: number; minute: number; lines: ReminderLine[] }[] = [
  { hour: 10, minute: 0, lines: BREAKFAST },
  { hour: 14, minute: 0, lines: LUNCH },
  { hour: 23, minute: 0, lines: DINNER },
];

function pick(lines: ReminderLine[], dayKey: string, slot: number): ReminderLine {
  let h = slot * 17 + 3;
  for (let i = 0; i < dayKey.length; i++) h = (h * 33 + dayKey.charCodeAt(i)) >>> 0;
  return lines[h % lines.length];
}

function atLocal(dayKey: string, hour: number, minute: number): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

let chain: Promise<void> = Promise.resolve();
let listening = false;

async function armFuelReminders() {
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    if (perm.display === "denied") return;
    const asked = await LocalNotifications.requestPermissions();
    if (asked.display !== "granted") return;
  }

  await LocalNotifications.createChannel({
    id: CHANNEL,
    name: "Fuel",
    description: "Breakfast, lunch, and dinner",
    importance: 4,
    visibility: 1,
    vibration: true,
  });

  const pending = await LocalNotifications.getPending();
  const mine = pending.notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + DAYS * 3 + 5);
  if (mine.length) await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });

  const start = todayKey();
  const now = Date.now();
  const notifications: LocalNotificationSchema[] = [];
  for (let offset = 0; offset < DAYS; offset++) {
    const dayKey = addDaysKey(start, offset);
    for (let slot = 0; slot < SLOTS.length; slot++) {
      const spec = SLOTS[slot];
      const when = atLocal(dayKey, spec.hour, spec.minute);
      if (when.getTime() <= now + 15_000) continue;
      const line = pick(spec.lines, dayKey, slot);
      notifications.push({
        id: ID_BASE + offset * 3 + slot,
        title: line.title,
        body: line.body,
        largeBody: line.body,
        channelId: CHANNEL,
        schedule: { at: when, allowWhileIdle: true },
        extra: { path: "/fuel" },
      });
    }
  }
  if (notifications.length) await LocalNotifications.schedule({ notifications });
}

function arm() {
  chain = chain.then(() => armFuelReminders()).catch(() => undefined);
}

export function installReminders() {
  if (!Capacitor.isNativePlatform() || listening) return;
  listening = true;
  arm();
  void CapApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) arm();
  });
  void LocalNotifications.addListener("localNotificationActionPerformed", () => {
    if (!window.location.hash.startsWith("#/fuel")) window.location.hash = "#/fuel";
  });
}
