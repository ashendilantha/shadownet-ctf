'use client';

import React, { useEffect, useState } from 'react';

type VectorCategory = 'ALL' | 'RECON' | 'CRYPTO' | 'EXPLOIT' | 'PIVOT';

interface MapNode {
  id: string;
  label: string;
  region: string;
  x: number;
  y: number;
  role: 'relay' | 'target';
  stage?: string;
  subsystem?: string;
  vector?: string;
  port?: string;
}

interface AttackArc {
  id: string;
  from: string;
  to: string;
  category: Exclude<VectorCategory, 'ALL'>;
  color: string;
  label: string;
  protocol: string;
  payload: string;
}

const MAP_NODES: MapNode[] = [
  // ShadowNet Underground Relay Nodes
  { id: 'rk', label: 'SN-RELAY-01', region: 'Reykjavik, IS', x: 355, y: 105, role: 'relay' },
  { id: 'fr', label: 'SN-RELAY-02', region: 'Frankfurt, DE', x: 438, y: 138, role: 'relay' },
  { id: 'sp', label: 'SN-RELAY-03', region: 'São Paulo, BR', x: 278, y: 278, role: 'relay' },
  { id: 'tk', label: 'SN-RELAY-04', region: 'Tokyo, JP', x: 698, y: 162, role: 'relay' },
  { id: 'sg', label: 'SN-RELAY-05', region: 'Singapore, SG', x: 632, y: 235, role: 'relay' },

  // NexaCorp Target Infrastructure Nodes
  {
    id: 'dmz',
    label: 'NEXA-DMZ-01',
    region: 'US-East Perimeter',
    x: 215,
    y: 158,
    role: 'target',
    stage: 'Stages 1–2',
    subsystem: 'Public Portal & SIGINT Array',
    vector: 'OSINT Recon & Audio Spectrogram',
    port: 'HTTPS 443 / 14.2 MHz',
  },
  {
    id: 'auth',
    label: 'NEXA-AUTH-04',
    region: 'EU-West SSO Gateway',
    x: 412,
    y: 150,
    role: 'target',
    stage: 'Stages 3–4',
    subsystem: 'Cipher Oracle & Employee SSO',
    vector: 'ECB Oracle & SQLi Auth Bypass',
    port: 'TCP 5000 / HTTP 8084',
  },
  {
    id: 'bastion',
    label: 'NEXA-ROOT-07',
    region: 'Zurich Bastion Host',
    x: 468,
    y: 166,
    role: 'target',
    stage: 'Stages 5–7',
    subsystem: 'PRNG Engine, ELF Daemon & Linux Host',
    vector: 'LCG Forecast, Binary RE & SUID PrivEsc',
    port: 'TCP 5005 / SSH 2222 / 2227',
  },
  {
    id: 'core',
    label: 'NEXA-CORE-08',
    region: 'APAC Isolated Vault',
    x: 668,
    y: 268,
    role: 'target',
    stage: 'Stage 08',
    subsystem: 'Internal Metadata & MySQL Cluster',
    vector: 'SSRF Perimeter Pivot & DB Exfil',
    port: '192.168.100.10:3306',
  },
];

const ATTACK_ARCS: AttackArc[] = [
  {
    id: 'arc-1',
    from: 'rk',
    to: 'dmz',
    category: 'RECON',
    color: '#9FEF00',
    label: 'DMZ Metadata Harvest',
    protocol: 'HTTPS/443',
    payload: 'GET /staff-directory.html [EXIF_LEAK]',
  },
  {
    id: 'arc-2',
    from: 'sp',
    to: 'dmz',
    category: 'CRYPTO',
    color: '#38BDF8',
    label: 'SIGINT Carrier Demod',
    protocol: 'SAT-14.2MHz',
    payload: 'FFT_LOCK ch14 -> pass:"shelter"',
  },
  {
    id: 'arc-3',
    from: 'fr',
    to: 'auth',
    category: 'CRYPTO',
    color: '#38BDF8',
    label: 'ECB Block Alignment',
    protocol: 'TCP/5000',
    payload: 'PROBE pad=15B -> byte_leak[0..31]',
  },
  {
    id: 'arc-4',
    from: 'rk',
    to: 'auth',
    category: 'EXPLOIT',
    color: '#D9A441',
    label: 'NexaAuth SQLi Bypass',
    protocol: 'HTTP/8084',
    payload: "POST /login user=' OR 1=1--",
  },
  {
    id: 'arc-5',
    from: 'tk',
    to: 'bastion',
    category: 'EXPLOIT',
    color: '#D9A441',
    label: 'ELF License Reverse',
    protocol: 'SSH/2222',
    payload: 'XOR_DECODE target.bin -> serial_ok',
  },
  {
    id: 'arc-6',
    from: 'fr',
    to: 'bastion',
    category: 'PIVOT',
    color: '#F87171',
    label: 'SUID PATH Hijack',
    protocol: 'SSH/2227',
    payload: 'PATH=/tmp:$PATH /usr/local/bin/backup',
  },
  {
    id: 'arc-7',
    from: 'sg',
    to: 'core',
    category: 'PIVOT',
    color: '#F87171',
    label: 'SSRF Pivot -> MySQL',
    protocol: 'INTERNAL/3306',
    payload: 'SSRF -> 192.168.100.10:8080/meta',
  },
  {
    id: 'arc-8',
    from: 'tk',
    to: 'core',
    category: 'RECON',
    color: '#9FEF00',
    label: 'Subnet Beacon Scan',
    protocol: 'ICMP/VLAN',
    payload: 'DISCOVER 192.168.100.0/24 [LIVE]',
  },
];

const FILTERS: { id: VectorCategory; label: string }[] = [
  { id: 'ALL', label: 'All Vectors' },
  { id: 'RECON', label: 'OSINT / Recon' },
  { id: 'CRYPTO', label: 'Crypto / SIGINT' },
  { id: 'EXPLOIT', label: 'Web / Binary' },
  { id: 'PIVOT', label: 'PrivEsc / Pivot' },
];

function buildArcPath(from: MapNode, to: MapNode): string {
  const midX = (from.x + to.x) / 2;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = Math.min(75, Math.max(26, dist * 0.24));
  const midY = Math.min(from.y, to.y) - lift;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}

export default function CyberThreatMap() {
  const [activeFilter, setActiveFilter] = useState<VectorCategory>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core');
  const [packetTick, setPacketTick] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketTick((prev) => prev + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const nodeMap = new Map(MAP_NODES.map((n) => [n.id, n]));
  const visibleArcs =
    activeFilter === 'ALL'
      ? ATTACK_ARCS
      : ATTACK_ARCS.filter((arc) => arc.category === activeFilter);

  const selectedNode = nodeMap.get(selectedNodeId) || nodeMap.get('core')!;

  // Rotate live event feed smoothly
  const liveEvents = visibleArcs.map((_, i) => {
    const idx = (i + packetTick) % visibleArcs.length;
    return visibleArcs[idx];
  });

  const livePacketsPerSec = 1280 + ((packetTick * 37) % 240);
  const liveLatencyMs = 18 + ((packetTick * 7) % 11);

  return (
    <section className="cyber-panel overflow-hidden p-5 sm:p-7 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono text-[#38BDF8] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse" />
            <span>GLOBAL CYBERMAP · LIVE ATTACK VECTORS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
            ShadowNet Mesh &amp; NexaCorp Threat Topology
          </h2>
        </div>

        {/* Interactive Vector Filter Chips */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter cybermap attack vectors">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              aria-pressed={activeFilter === f.id}
              className="filter-chip text-[11px] font-mono"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Cybermap SVG + Live Intercept Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive SVG Cybermap */}
        <div className="xl:col-span-8 relative rounded-xl border border-white/[0.1] bg-[#050914]/75 overflow-hidden p-3 sm:p-4 flex flex-col justify-between">
          {/* Top HUD Overlay Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-white/[0.07] font-mono text-[11px]">
            <div className="flex items-center gap-3 text-[#A4B1CD]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9FEF00] shadow-[0_0_6px_#9FEF00]" />
                ShadowNet Relay
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F87171] shadow-[0_0_6px_#F87171]" />
                NexaCorp Target
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#A4B1CD]">
              <span>
                PKT/S: <strong className="text-[#9FEF00]">{livePacketsPerSec}</strong>
              </span>
              <span className="text-white/15">|</span>
              <span>
                RTT: <strong className="text-[#38BDF8]">{liveLatencyMs}ms</strong>
              </span>
            </div>
          </div>

          {/* Vector World Grid + Animated Attack Trajectories */}
          <div className="relative w-full aspect-[16/8.2] min-h-[240px]">
            <svg
              viewBox="0 0 800 380"
              className="w-full h-full"
              role="img"
              aria-label="Global cybermap showing ShadowNet relay nodes routing attacks into NexaCorp target datacenters"
            >
              <defs>
                <pattern id="cyberMapGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.08)"
                    strokeWidth="0.8"
                  />
                </pattern>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.14)" />
                  <stop offset="100%" stopColor="rgba(5, 9, 20, 0)" />
                </radialGradient>
              </defs>

              <rect width="800" height="380" fill="url(#cyberMapGrid)" />
              <rect width="800" height="380" fill="url(#mapGlow)" />

              {/* Stylized Abstract Continent Silhouettes */}
              <g fill="rgba(148, 163, 184, 0.1)" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="0.9">
                {/* North America */}
                <path d="M 85 95 L 175 75 L 245 92 L 260 135 L 228 178 L 195 205 L 155 190 L 122 150 Z" />
                {/* South America */}
                <path d="M 225 218 L 280 228 L 306 270 L 278 332 L 248 340 L 234 290 L 215 245 Z" />
                {/* Europe */}
                <path d="M 372 88 L 458 78 L 490 112 L 478 158 L 420 164 L 385 142 Z" />
                {/* Africa */}
                <path d="M 392 178 L 468 174 L 502 222 L 478 308 L 432 318 L 402 252 L 382 212 Z" />
                {/* Asia */}
                <path d="M 498 85 L 650 78 L 722 122 L 705 192 L 642 225 L 568 214 L 512 172 Z" />
                {/* Oceania */}
                <path d="M 622 258 L 705 262 L 722 308 L 664 322 L 620 296 Z" />
              </g>

              {/* Equator & Tactical Latitude Lines */}
              <line x1="0" y1="190" x2="800" y2="190" stroke="rgba(56, 189, 248, 0.12)" strokeDasharray="4 6" />
              <line x1="400" y1="0" x2="400" y2="380" stroke="rgba(159, 239, 0, 0.08)" strokeDasharray="4 6" />

              {/* Animated Attack Arcs */}
              {visibleArcs.map((arc) => {
                const from = nodeMap.get(arc.from);
                const to = nodeMap.get(arc.to);
                if (!from || !to) return null;
                const d = buildArcPath(from, to);
                const isSelected = selectedNodeId === arc.to || selectedNodeId === arc.from;
                return (
                  <g key={arc.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke={arc.color}
                      strokeOpacity={isSelected ? 0.32 : 0.16}
                      strokeWidth={isSelected ? 2 : 1.25}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={isSelected ? 2.4 : 1.7}
                      strokeLinecap="round"
                      className="cyber-arc-animated"
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {MAP_NODES.map((node) => {
                const isTarget = node.role === 'target';
                const isSelected = node.id === selectedNodeId;
                const fill = isTarget ? '#F87171' : '#9FEF00';
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${node.label} in ${node.region}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedNodeId(node.id);
                      }
                    }}
                  >
                    {isTarget && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 10 : 7}
                        fill="none"
                        stroke={fill}
                        strokeWidth="1.5"
                        className="cyber-node-ping"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 6.5 : isTarget ? 5 : 3.8}
                      fill={fill}
                      stroke="#050914"
                      strokeWidth="1.8"
                    />
                    <text
                      x={node.x}
                      y={node.y - 10}
                      textAnchor="middle"
                      fill={isSelected ? '#F8FAFC' : '#A4B1CD'}
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Node Inspector Strip */}
          <div className="mt-2 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  selectedNode.role === 'target'
                    ? 'text-[#F87171] bg-[#F87171]/10 border-[#F87171]/35'
                    : 'text-[#9FEF00] bg-[#9FEF00]/10 border-[#9FEF00]/35'
                }`}
              >
                {selectedNode.role === 'target' ? 'TARGET NODE' : 'RELAY NODE'}
              </span>
              <span className="text-[#F8FAFC] font-bold">{selectedNode.label}</span>
              <span className="text-white/20">·</span>
              <span className="text-[#A4B1CD]">{selectedNode.region}</span>
            </div>
            <div className="text-[11px] text-[#38BDF8]">
              {selectedNode.role === 'target'
                ? `${selectedNode.stage} · ${selectedNode.vector} (${selectedNode.port})`
                : 'Encrypted Onion Mesh · 4096-bit WireGuard Tunnel'}
            </div>
          </div>
        </div>

        {/* Right: Live Intercepted Attack Feed */}
        <div className="xl:col-span-4 rounded-xl border border-white/[0.1] bg-[#050914]/70 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
            <span className="font-mono text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9FEF00] shadow-[0_0_8px_#9FEF00] animate-pulse" />
              Live Packet Intercept
            </span>
            <span className="font-mono text-[10px] text-[#9FEF00] bg-[#9FEF00]/10 px-2 py-0.5 rounded border border-[#9FEF00]/25">
              {visibleArcs.length} ACTIVE
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[295px] pr-1">
            {liveEvents.slice(0, 5).map((ev, index) => {
              const src = nodeMap.get(ev.from);
              const dst = nodeMap.get(ev.to);
              return (
                <button
                  key={`${ev.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedNodeId(ev.to)}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-[#9FEF00]/35 transition-all font-mono space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold" style={{ color: ev.color }}>
                      {ev.label}
                    </span>
                    <span className="text-[#A4B1CD]">{ev.protocol}</span>
                  </div>
                  <div className="text-[10px] text-[#A4B1CD] truncate">
                    {src?.label} → <span className="text-[#F8FAFC]">{dst?.label}</span>
                  </div>
                  <div className="text-[10px] text-[#6B7894] truncate">{ev.payload}</div>
                </button>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-white/[0.08] grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[#6B7894] block">THREAT LEVEL</span>
              <span className="text-[#F87171] font-bold">CRITICAL / RED</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[#6B7894] block">MESH ENCRYPTION</span>
              <span className="text-[#9FEF00] font-bold">AES-256-GCM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
