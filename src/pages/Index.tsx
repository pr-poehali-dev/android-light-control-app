import { useState } from "react";
import Icon from "@/components/ui/icon";

type Protocol = "Wi-Fi" | "Zigbee" | "Z-Wave" | "Bluetooth";

interface Lamp {
  id: number;
  name: string;
  room: string;
  on: boolean;
  brightness: number;
  protocol: Protocol;
}

interface Scene {
  id: number;
  name: string;
  icon: string;
  description: string;
  lamps: Record<number, { on: boolean; brightness: number }>;
}

interface Timer {
  id: number;
  label: string;
  time: string;
  action: "on" | "off";
  days: string[];
  active: boolean;
}

const PROTOCOL_COLORS: Record<Protocol, string> = {
  "Wi-Fi": "#4a9eff",
  "Zigbee": "#a78bfa",
  "Z-Wave": "#34d399",
  "Bluetooth": "#60a5fa",
};

const INITIAL_LAMPS: Lamp[] = [
  { id: 1, name: "Потолочный свет", room: "Гостиная", on: true, brightness: 80, protocol: "Wi-Fi" },
  { id: 2, name: "Торшер", room: "Гостиная", on: false, brightness: 50, protocol: "Zigbee" },
  { id: 3, name: "Ночник", room: "Спальня", on: true, brightness: 20, protocol: "Zigbee" },
  { id: 4, name: "Рабочий стол", room: "Спальня", on: false, brightness: 100, protocol: "Z-Wave" },
  { id: 5, name: "Подсветка", room: "Кухня", on: true, brightness: 60, protocol: "Wi-Fi" },
  { id: 6, name: "Основной свет", room: "Кухня", on: false, brightness: 90, protocol: "Bluetooth" },
];

const INITIAL_SCENES: Scene[] = [
  {
    id: 1, name: "Кино", icon: "Film", description: "Приглушённый свет для просмотра",
    lamps: { 1: { on: true, brightness: 15 }, 2: { on: true, brightness: 25 }, 3: { on: false, brightness: 20 }, 4: { on: false, brightness: 100 }, 5: { on: false, brightness: 60 }, 6: { on: false, brightness: 90 } }
  },
  {
    id: 2, name: "Утро", icon: "Sunrise", description: "Мягкое пробуждение",
    lamps: { 1: { on: false, brightness: 80 }, 2: { on: false, brightness: 50 }, 3: { on: true, brightness: 40 }, 4: { on: true, brightness: 55 }, 5: { on: true, brightness: 70 }, 6: { on: true, brightness: 80 } }
  },
  {
    id: 3, name: "Работа", icon: "Briefcase", description: "Яркий фокусный свет",
    lamps: { 1: { on: true, brightness: 100 }, 2: { on: false, brightness: 50 }, 3: { on: false, brightness: 20 }, 4: { on: true, brightness: 100 }, 5: { on: true, brightness: 100 }, 6: { on: true, brightness: 100 } }
  },
  {
    id: 4, name: "Ночь", icon: "Moon", description: "Минимальное освещение",
    lamps: { 1: { on: false, brightness: 80 }, 2: { on: false, brightness: 50 }, 3: { on: true, brightness: 8 }, 4: { on: false, brightness: 100 }, 5: { on: false, brightness: 60 }, 6: { on: false, brightness: 90 } }
  },
  {
    id: 5, name: "Ужин", icon: "UtensilsCrossed", description: "Тёплый уют",
    lamps: { 1: { on: true, brightness: 45 }, 2: { on: true, brightness: 60 }, 3: { on: false, brightness: 20 }, 4: { on: false, brightness: 100 }, 5: { on: true, brightness: 80 }, 6: { on: true, brightness: 70 } }
  },
  {
    id: 6, name: "Вечеринка", icon: "Sparkles", description: "Яркий праздничный свет",
    lamps: { 1: { on: true, brightness: 100 }, 2: { on: true, brightness: 100 }, 3: { on: true, brightness: 100 }, 4: { on: true, brightness: 100 }, 5: { on: true, brightness: 100 }, 6: { on: true, brightness: 100 } }
  },
];

const INITIAL_TIMERS: Timer[] = [
  { id: 1, label: "Подъём", time: "07:00", action: "on", days: ["Пн", "Вт", "Ср", "Чт", "Пт"], active: true },
  { id: 2, label: "Отбой", time: "23:30", action: "off", days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], active: true },
  { id: 3, label: "Выходной", time: "09:30", action: "on", days: ["Сб", "Вс"], active: false },
];

const ALL_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type Tab = "home" | "scenes" | "timers" | "settings";

export default function Index() {
  const [lamps, setLamps] = useState<Lamp[]>(INITIAL_LAMPS);
  const [scenes] = useState<Scene[]>(INITIAL_SCENES);
  const [timers, setTimers] = useState<Timer[]>(INITIAL_TIMERS);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const [showAddTimer, setShowAddTimer] = useState(false);
  const [editingLamp, setEditingLamp] = useState<Lamp | null>(null);
  const [showAddLamp, setShowAddLamp] = useState(false);
  const [newLamp, setNewLamp] = useState<{ name: string; room: string; protocol: Protocol }>({ name: "", room: "", protocol: "Wi-Fi" });

  const toggleLamp = (id: number) => {
    setLamps(prev => prev.map(l => l.id === id ? { ...l, on: !l.on } : l));
    setActiveScene(null);
  };

  const setBrightness = (id: number, brightness: number) => {
    setLamps(prev => prev.map(l => l.id === id ? { ...l, brightness } : l));
    setActiveScene(null);
  };

  const applyScene = (scene: Scene) => {
    setLamps(prev => prev.map(l => {
      const s = scene.lamps[l.id];
      return s ? { ...l, on: s.on, brightness: s.brightness } : l;
    }));
    setActiveScene(scene.id);
  };

  const toggleTimer = (id: number) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const addLamp = () => {
    if (!newLamp.name.trim() || !newLamp.room.trim()) return;
    setLamps(prev => [...prev, { ...newLamp, id: Date.now(), on: false, brightness: 80 }]);
    setNewLamp({ name: "", room: "", protocol: "Wi-Fi" });
    setShowAddLamp(false);
  };

  const deleteLamp = (id: number) => {
    setLamps(prev => prev.filter(l => l.id !== id));
    setEditingLamp(null);
  };

  const saveEditLamp = (updated: Lamp) => {
    setLamps(prev => prev.map(l => l.id === updated.id ? updated : l));
    setEditingLamp(null);
  };

  const onCount = lamps.filter(l => l.on).length;
  const rooms = [...new Set(lamps.map(l => l.room))];

  return (
    <div className="min-h-screen font-golos" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>
      <div className="max-w-sm mx-auto min-h-screen flex flex-col relative">

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ color: "var(--app-text-dim)" }}>
          <span className="text-xs font-mono-app">09:41</span>
          <span className="text-xs font-semibold tracking-widest" style={{ color: "var(--app-warm)" }}>LightOS</span>
          <div className="flex gap-1 items-center">
            <Icon name="Wifi" size={12} />
            <Icon name="Battery" size={12} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">

          {/* HOME */}
          {activeTab === "home" && (
            <div className="px-4 animate-fade-in">
              <div className="mt-4 mb-6">
                <p className="text-xs mb-1" style={{ color: "var(--app-text-dim)" }}>Добрый вечер</p>
                <div className="flex items-end justify-between">
                  <h1 className="text-2xl font-bold">Мой дом</h1>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full pulse-warm" style={{ background: "var(--app-warm)" }} />
                    <span className="text-sm font-mono-app" style={{ color: "var(--app-warm)" }}>{onCount} активно</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Ламп", value: lamps.length, icon: "Lightbulb" },
                  { label: "Включено", value: onCount, icon: "Power" },
                  { label: "Протоколов", value: new Set(lamps.map(l => l.protocol)).size, icon: "Wifi" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                    <Icon name={stat.icon as "Lightbulb"} size={16} style={{ color: "var(--app-text-dim)", margin: "0 auto 4px" }} />
                    <div className="text-xl font-bold font-mono-app" style={{ color: "var(--app-warm)" }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: "var(--app-text-dim)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setLamps(prev => prev.map(l => ({ ...l, on: false }))); setActiveScene(null); }}
                className="w-full rounded-xl py-3 mb-5 text-sm font-medium transition-all"
                style={{
                  background: onCount > 0 ? "rgba(245,200,66,0.08)" : "var(--app-surface)",
                  border: `1px solid ${onCount > 0 ? "rgba(245,200,66,0.2)" : "var(--app-border)"}`,
                  color: onCount > 0 ? "var(--app-warm)" : "var(--app-text-dim)",
                }}
              >
                Выключить всё
              </button>

              {rooms.map(room => (
                <div key={room} className="mb-5">
                  <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "var(--app-text-dim)" }}>{room}</p>
                  <div className="flex flex-col gap-2">
                    {lamps.filter(l => l.room === room).map(lamp => (
                      <LampCard key={lamp.id} lamp={lamp} onToggle={() => toggleLamp(lamp.id)} onBrightness={v => setBrightness(lamp.id, v)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SCENES */}
          {activeTab === "scenes" && (
            <div className="px-4 animate-fade-in">
              <div className="mt-4 mb-6">
                <p className="text-xs mb-1" style={{ color: "var(--app-text-dim)" }}>Управление</p>
                <h1 className="text-2xl font-bold">Сценарии</h1>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => applyScene(scene)}
                    className="rounded-2xl p-4 text-left transition-all active:scale-95"
                    style={{
                      background: activeScene === scene.id ? "rgba(245,200,66,0.12)" : "var(--app-surface)",
                      border: `1px solid ${activeScene === scene.id ? "rgba(245,200,66,0.3)" : "var(--app-border)"}`,
                      boxShadow: activeScene === scene.id ? "0 0 20px rgba(245,200,66,0.08)" : "none",
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: activeScene === scene.id ? "rgba(245,200,66,0.15)" : "var(--app-surface-2)" }}>
                      <Icon name={scene.icon as "Film"} size={20} style={{ color: activeScene === scene.id ? "var(--app-warm)" : "var(--app-text-dim)" }} />
                    </div>
                    <div className="font-semibold text-sm mb-1" style={{ color: activeScene === scene.id ? "var(--app-warm)" : "var(--app-text)" }}>
                      {scene.name}
                    </div>
                    <div className="text-xs leading-tight" style={{ color: "var(--app-text-dim)" }}>{scene.description}</div>
                    {activeScene === scene.id && (
                      <div className="mt-2 text-xs font-medium" style={{ color: "var(--app-warm)" }}>✓ Активен</div>
                    )}
                  </button>
                ))}
              </div>

              {activeScene && (
                <div className="mt-5 animate-fade-in">
                  <p className="text-xs mb-3 uppercase tracking-widest" style={{ color: "var(--app-text-dim)" }}>Текущее состояние</p>
                  <div className="flex flex-col gap-2">
                    {lamps.map(lamp => (
                      <div key={lamp.id} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                        style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: lamp.on ? "var(--app-warm)" : "var(--app-text-dim)" }} />
                          <span className="text-sm">{lamp.name}</span>
                        </div>
                        <span className="text-xs font-mono-app" style={{ color: lamp.on ? "var(--app-warm)" : "var(--app-text-dim)" }}>
                          {lamp.on ? `${lamp.brightness}%` : "Выкл"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIMERS */}
          {activeTab === "timers" && (
            <div className="px-4 animate-fade-in">
              <div className="mt-4 mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--app-text-dim)" }}>Расписание</p>
                  <h1 className="text-2xl font-bold">Таймеры</h1>
                </div>
                <button
                  onClick={() => setShowAddTimer(!showAddTimer)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: showAddTimer ? "rgba(245,200,66,0.15)" : "var(--app-surface)",
                    border: `1px solid ${showAddTimer ? "rgba(245,200,66,0.3)" : "var(--app-border)"}`,
                  }}
                >
                  <Icon name={showAddTimer ? "X" : "Plus"} size={16} style={{ color: "var(--app-warm)" }} />
                </button>
              </div>

              {showAddTimer && (
                <div className="rounded-2xl p-4 mb-4 animate-scale-in"
                  style={{ background: "var(--app-surface)", border: "1px solid rgba(245,200,66,0.15)" }}>
                  <p className="text-sm font-medium mb-3">Новый таймер</p>
                  <div className="flex flex-col gap-3">
                    <input type="time" className="rounded-xl px-3 py-2.5 text-sm w-full outline-none"
                      style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
                      defaultValue="08:00" />
                    <div className="flex gap-2">
                      {["Вкл", "Выкл"].map((a, i) => (
                        <button key={a} className="flex-1 py-2 rounded-xl text-sm font-medium"
                          style={{
                            background: i === 0 ? "rgba(245,200,66,0.12)" : "var(--app-surface-2)",
                            border: `1px solid ${i === 0 ? "rgba(245,200,66,0.25)" : "var(--app-border)"}`,
                            color: i === 0 ? "var(--app-warm)" : "var(--app-text-dim)",
                          }}>
                          {a}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {ALL_DAYS.map(d => (
                        <button key={d} className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: ["Пн", "Вт", "Ср", "Чт", "Пт"].includes(d) ? "rgba(245,200,66,0.1)" : "var(--app-surface-2)",
                            border: `1px solid ${["Пн", "Вт", "Ср", "Чт", "Пт"].includes(d) ? "rgba(245,200,66,0.2)" : "var(--app-border)"}`,
                            color: ["Пн", "Вт", "Ср", "Чт", "Пт"].includes(d) ? "var(--app-warm)" : "var(--app-text-dim)",
                          }}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--app-warm)", color: "#0a0a0f" }}>
                      Создать
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {timers.map(timer => (
                  <div key={timer.id} className="rounded-2xl p-4 transition-all"
                    style={{
                      background: "var(--app-surface)",
                      border: `1px solid ${timer.active ? "rgba(245,200,66,0.12)" : "var(--app-border)"}`,
                      opacity: timer.active ? 1 : 0.5,
                    }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold">{timer.label}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-3xl font-bold font-mono-app" style={{ color: timer.active ? "var(--app-warm)" : "var(--app-text-dim)" }}>
                            {timer.time}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: timer.action === "on" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                              color: timer.action === "on" ? "var(--app-success)" : "#f87171",
                            }}>
                            {timer.action === "on" ? "Включить" : "Выключить"}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => toggleTimer(timer.id)}
                        className="relative w-12 h-6 rounded-full transition-all"
                        style={{ background: timer.active ? "var(--app-warm)" : "var(--app-surface-2)", border: "1px solid var(--app-border)" }}>
                        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                          style={{ background: timer.active ? "#0a0a0f" : "var(--app-text-dim)", left: timer.active ? "calc(100% - 22px)" : "2px" }} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {ALL_DAYS.map(d => (
                        <div key={d} className="flex-1 py-1 rounded-lg text-xs text-center font-medium"
                          style={{
                            background: timer.days.includes(d) ? "rgba(245,200,66,0.1)" : "transparent",
                            color: timer.days.includes(d) ? "var(--app-warm)" : "var(--app-text-dim)",
                          }}>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 mb-2 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(74,158,255,0.1)" }}>
                  <Icon name="Wifi" size={18} style={{ color: "var(--app-accent)" }} />
                </div>
                <div>
                  <div className="text-sm font-medium">Мультипротокол</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--app-text-dim)" }}>Wi-Fi · Zigbee · Z-Wave · Bluetooth</div>
                </div>
                <div className="ml-auto flex gap-1">
                  {Object.values(PROTOCOL_COLORS).map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="px-4 animate-fade-in">
              <div className="mt-4 mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--app-text-dim)" }}>Устройства</p>
                  <h1 className="text-2xl font-bold">Настройки</h1>
                </div>
                <button
                  onClick={() => { setShowAddLamp(!showAddLamp); setEditingLamp(null); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: showAddLamp ? "rgba(245,200,66,0.15)" : "var(--app-surface)",
                    border: `1px solid ${showAddLamp ? "rgba(245,200,66,0.3)" : "var(--app-border)"}`,
                  }}
                >
                  <Icon name={showAddLamp ? "X" : "Plus"} size={16} style={{ color: "var(--app-warm)" }} />
                </button>
              </div>

              {/* Add lamp form */}
              {showAddLamp && (
                <div className="rounded-2xl p-4 mb-4 animate-scale-in"
                  style={{ background: "var(--app-surface)", border: "1px solid rgba(245,200,66,0.2)" }}>
                  <p className="text-sm font-semibold mb-3">Новая лампа</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Название</label>
                      <input
                        type="text"
                        placeholder="Напр. Торшер"
                        value={newLamp.name}
                        onChange={e => setNewLamp(p => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Комната</label>
                      <input
                        type="text"
                        placeholder="Напр. Гостиная"
                        value={newLamp.room}
                        onChange={e => setNewLamp(p => ({ ...p, room: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Протокол</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Wi-Fi", "Zigbee", "Z-Wave", "Bluetooth"] as Protocol[]).map(p => (
                          <button key={p} onClick={() => setNewLamp(prev => ({ ...prev, protocol: p }))}
                            className="py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: newLamp.protocol === p ? "rgba(245,200,66,0.12)" : "var(--app-surface-2)",
                              border: `1px solid ${newLamp.protocol === p ? "rgba(245,200,66,0.3)" : "var(--app-border)"}`,
                              color: newLamp.protocol === p ? "var(--app-warm)" : "var(--app-text-dim)",
                            }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: PROTOCOL_COLORS[p], verticalAlign: "middle" }} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={addLamp}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold mt-1"
                      style={{ background: newLamp.name && newLamp.room ? "var(--app-warm)" : "var(--app-surface-2)", color: newLamp.name && newLamp.room ? "#0a0a0f" : "var(--app-text-dim)" }}>
                      Добавить
                    </button>
                  </div>
                </div>
              )}

              {/* Edit lamp modal */}
              {editingLamp && (
                <div className="rounded-2xl p-4 mb-4 animate-scale-in"
                  style={{ background: "var(--app-surface)", border: "1px solid rgba(74,158,255,0.2)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Редактировать</p>
                    <button onClick={() => setEditingLamp(null)}>
                      <Icon name="X" size={16} style={{ color: "var(--app-text-dim)" }} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Название</label>
                      <input type="text" value={editingLamp.name}
                        onChange={e => setEditingLamp(p => p ? { ...p, name: e.target.value } : p)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Комната</label>
                      <input type="text" value={editingLamp.room}
                        onChange={e => setEditingLamp(p => p ? { ...p, room: e.target.value } : p)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: "var(--app-surface-2)", border: "1px solid var(--app-border)", color: "var(--app-text)" }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "var(--app-text-dim)" }}>Протокол</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Wi-Fi", "Zigbee", "Z-Wave", "Bluetooth"] as Protocol[]).map(p => (
                          <button key={p} onClick={() => setEditingLamp(prev => prev ? { ...prev, protocol: p } : prev)}
                            className="py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: editingLamp.protocol === p ? "rgba(245,200,66,0.12)" : "var(--app-surface-2)",
                              border: `1px solid ${editingLamp.protocol === p ? "rgba(245,200,66,0.3)" : "var(--app-border)"}`,
                              color: editingLamp.protocol === p ? "var(--app-warm)" : "var(--app-text-dim)",
                            }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: PROTOCOL_COLORS[p], verticalAlign: "middle" }} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => deleteLamp(editingLamp.id)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                        Удалить
                      </button>
                      <button onClick={() => saveEditLamp(editingLamp)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: "var(--app-warm)", color: "#0a0a0f" }}>
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lamps list */}
              {rooms.map(room => (
                <div key={room} className="mb-5">
                  <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "var(--app-text-dim)" }}>{room}</p>
                  <div className="flex flex-col gap-2">
                    {lamps.filter(l => l.room === room).map(lamp => (
                      <button key={lamp.id} onClick={() => { setEditingLamp(lamp); setShowAddLamp(false); }}
                        className="flex items-center justify-between rounded-xl px-4 py-3 w-full text-left transition-all"
                        style={{
                          background: editingLamp?.id === lamp.id ? "rgba(74,158,255,0.08)" : "var(--app-surface)",
                          border: `1px solid ${editingLamp?.id === lamp.id ? "rgba(74,158,255,0.25)" : "var(--app-border)"}`,
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: lamp.on ? "rgba(245,200,66,0.1)" : "var(--app-surface-2)" }}>
                            <Icon name="Lightbulb" size={16} style={{ color: lamp.on ? "var(--app-warm)" : "var(--app-text-dim)" }} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{lamp.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: PROTOCOL_COLORS[lamp.protocol] }} />
                              <span className="text-xs" style={{ color: "var(--app-text-dim)" }}>{lamp.protocol}</span>
                            </div>
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={16} style={{ color: "var(--app-text-dim)" }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Info block */}
              <div className="rounded-2xl p-4 mb-2"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Info" size={15} style={{ color: "var(--app-accent)" }} />
                  <span className="text-sm font-medium">Поддерживаемые протоколы</span>
                </div>
                {(["Wi-Fi", "Zigbee", "Z-Wave", "Bluetooth"] as Protocol[]).map(p => (
                  <div key={p} className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid var(--app-border)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PROTOCOL_COLORS[p] }} />
                      <span className="text-sm">{p}</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--app-text-dim)" }}>
                      {lamps.filter(l => l.protocol === p).length} ламп
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm"
          style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--app-border)" }}>
          <div className="flex items-center justify-around px-4 py-3 pb-6">
            {([
              { id: "home" as Tab, icon: "Home", label: "Дом" },
              { id: "scenes" as Tab, icon: "Sparkles", label: "Сцены" },
              { id: "timers" as Tab, icon: "Clock", label: "Таймер" },
              { id: "settings" as Tab, icon: "Settings2", label: "Устройства" },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 py-1 px-5 rounded-xl transition-all"
                style={{ color: activeTab === tab.id ? "var(--app-warm)" : "var(--app-text-dim)" }}
              >
                <Icon name={tab.icon as "Home"} size={22} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function LampCard({ lamp, onToggle, onBrightness }: { lamp: Lamp; onToggle: () => void; onBrightness: (v: number) => void }) {
  return (
    <div className="rounded-2xl p-4 transition-all"
      style={{
        background: "var(--app-surface)",
        border: `1px solid ${lamp.on ? "rgba(245,200,66,0.15)" : "var(--app-border)"}`,
        boxShadow: lamp.on ? "0 0 16px rgba(245,200,66,0.05)" : "none",
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: lamp.on ? "rgba(245,200,66,0.12)" : "var(--app-surface-2)" }}>
            <Icon name="Lightbulb" size={18} style={{ color: lamp.on ? "var(--app-warm)" : "var(--app-text-dim)" }} />
          </div>
          <div>
            <div className="text-sm font-medium">{lamp.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: PROTOCOL_COLORS[lamp.protocol] }} />
              <span className="text-xs" style={{ color: "var(--app-text-dim)" }}>{lamp.protocol}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="relative w-12 h-6 rounded-full transition-all"
          style={{ background: lamp.on ? "var(--app-warm)" : "var(--app-surface-2)", border: `1px solid ${lamp.on ? "transparent" : "var(--app-border)"}` }}
        >
          <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
            style={{ background: lamp.on ? "#0a0a0f" : "var(--app-text-dim)", left: lamp.on ? "calc(100% - 22px)" : "2px" }} />
        </button>
      </div>

      {lamp.on && (
        <div className="flex items-center gap-3 animate-fade-in">
          <Icon name="Sun" size={14} style={{ color: "var(--app-text-dim)", flexShrink: 0 }} />
          <input
            type="range" min={1} max={100} value={lamp.brightness}
            onChange={e => onBrightness(Number(e.target.value))}
            style={{ flex: 1, background: `linear-gradient(to right, var(--app-warm) 0%, var(--app-warm) ${lamp.brightness}%, var(--app-surface-2) ${lamp.brightness}%, var(--app-surface-2) 100%)` }}
          />
          <span className="text-xs font-mono-app w-8 text-right" style={{ color: "var(--app-warm)" }}>{lamp.brightness}%</span>
        </div>
      )}
    </div>
  );
}