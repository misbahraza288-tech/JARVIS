
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  VOICE = 'VOICE',
  IMAGE_GEN = 'IMAGE_GEN',
  VIDEO_GEN = 'VIDEO_GEN',
  VIDEO_ANALYSIS = 'VIDEO_ANALYSIS',
  OS_CONTROL = 'OS_CONTROL',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  BLUEPRINT = 'BLUEPRINT'
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'system' | 'ai' | 'user';
  message: string;
  action?: string;
}

export interface ImageConfig {
  aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  imageSize: "1K" | "2K" | "4K";
}

export interface VideoConfig {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface UserProfile {
  name: string;
  role: string;
  personalData: string;
  activated: boolean;
  licenseKey: string;
}
