export const THEME_COLORS = {
  bg: '#090B0D',
  surface: '#111417',
  cards: '#171B20',
  border: '#252A30',
  primary: '#FF6B00',
  accent: '#FF9F43',
  cyan: '#22D3EE',
  text: '#F5F5F5',
  muted: '#8B949E',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export interface StageInfo {
  stage: number;
  name: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Static' | 'Docker' | 'VM' | 'VMs';
  points: number;
  port?: string;
  statusCheck: string;
  accessGuide: string;
}

export const STAGE_CONFIGS: Record<number, StageInfo> = {
  1: {
    stage: 1,
    name: 'NexaCorp Reconnaissance',
    domain: 'OSINT',
    difficulty: 'Easy',
    type: 'Static',
    points: 100,
    port: '5000 (dashboard)',
    statusCheck: 'curl http://localhost:5000',
    accessGuide: 'Inspect public files, metadata and website headers for intelligence leaks.',
  },
  2: {
    stage: 2,
    name: 'Covert Transmissions',
    domain: 'Steganography',
    difficulty: 'Medium',
    type: 'Static',
    points: 150,
    port: 'N/A (Downloadable Package)',
    statusCheck: 'unzip stage2-covert-transmissions.zip',
    accessGuide: 'Download and extract the intercepted transmission package (.zip). Use steghide to extract intel from whistleblower.jpg, and inspect the frequency spectrogram of the authentic audio in Audacity.',
  },
  3: {
    stage: 3,
    name: 'Cipher Oracle',
    domain: 'Cryptography',
    difficulty: 'Medium',
    type: 'Docker',
    points: 200,
    port: '5000',
    statusCheck: 'nc localhost 5000',
    accessGuide: 'Connect via TCP/Netcat to interact with the encryption oracle: nc localhost 5000',
  },
  4: {
    stage: 4,
    name: 'NexaAuth Portal Bypass',
    domain: 'Web Security',
    difficulty: 'Medium',
    type: 'Docker',
    points: 250,
    port: '3000',
    statusCheck: 'curl http://localhost:3000',
    accessGuide: 'Target the SQL injection vulnerability on the login endpoint: http://localhost:3000',
  },
  5: {
    stage: 5,
    name: 'PRNG Token Predictor',
    domain: 'Scripting',
    difficulty: 'Medium',
    type: 'Docker',
    points: 300,
    port: '5001',
    statusCheck: 'nc localhost 5001',
    accessGuide: 'Connect to the token stream and predict next pseudo-random states: nc localhost 5001',
  },
  6: {
    stage: 6,
    name: 'Binary Disassembly',
    domain: 'Reverse Engineering',
    difficulty: 'Hard',
    type: 'VM',
    points: 350,
    port: 'SSH',
    statusCheck: 'ssh player@<host>',
    accessGuide: 'SSH into the reverse engineering sandbox VM and analyze target.bin with Ghidra/GDB.',
  },
  7: {
    stage: 7,
    name: 'Privilege Escalation',
    domain: 'Linux Security',
    difficulty: 'Hard',
    type: 'VM',
    points: 400,
    port: 'SSH',
    statusCheck: 'ssh player@<host>',
    accessGuide: 'SSH into the Linux target machine, identify vulnerable SUID binaries, and escalate to root.',
  },
  8: {
    stage: 8,
    name: 'Core Infrastructure Breach',
    domain: 'Network Pivoting',
    difficulty: 'Hard',
    type: 'VMs',
    points: 500,
    port: 'SSH/HTTP',
    statusCheck: 'Combined test',
    accessGuide: 'Exploit SSRF on Entry Host (port 3000) to pivot to metadata service and dump internal MySQL database.',
  },
};
