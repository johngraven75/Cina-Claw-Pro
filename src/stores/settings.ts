/**
 * Settings State Store
 * Manages application settings
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';
import { hostApi } from '@/lib/host-api';
import { resolveSupportedLanguage } from '@shared/language';
import { DEFAULT_WORKSPACE_CWD, MAX_RECENT_WORKSPACES } from '@shared/workspace';
import { DEFAULT_VOICE_PROFILE_ID, getVoiceProfile } from '@shared/voice';
import {
  getWorkspaceDisplayLabel,
  isDefaultWorkspacePath,
  normalizeWorkspacePath,
} from '@/lib/workspace-context';

type Theme = 'light' | 'dark' | 'system';
type UpdateChannel = 'stable' | 'beta' | 'dev';

interface SettingsState {
  // General
  theme: Theme;
  language: string;
  startMinimized: boolean;
  launchAtStartup: boolean;
  telemetryEnabled: boolean;

  // Gateway
  gatewayAutoStart: boolean;
  gatewayPort: number;
  proxyEnabled: boolean;
  proxyServer: string;
  proxyHttpServer: string;
  proxyHttpsServer: string;
  proxyAllServer: string;
  proxyBypassRules: string;

  // Update
  updateChannel: UpdateChannel;
  autoCheckUpdate: boolean;

  // UI State
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  devModeUnlocked: boolean;
  chatWorkspacePath: string;
  recentWorkspacePaths: string[];
  workspaceLabels: Record<string, string>;

  // Voice Chat
  voiceEnabled: boolean;
  voiceProfileId: string;
  voiceAutoRead: boolean;
  voiceAutoSend: boolean;
  voiceSpeed: number;
  voiceDepth: number;

  // Setup
  setupComplete: boolean;

  // Actions
  init: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setStartMinimized: (value: boolean) => void;
  setLaunchAtStartup: (value: boolean) => void;
  setTelemetryEnabled: (value: boolean) => void;
  setGatewayAutoStart: (value: boolean) => void;
  setGatewayPort: (port: number) => void;
  setProxyEnabled: (value: boolean) => void;
  setProxyServer: (value: string) => void;
  setProxyHttpServer: (value: string) => void;
  setProxyHttpsServer: (value: string) => void;
  setProxyAllServer: (value: string) => void;
  setProxyBypassRules: (value: string) => void;
  setUpdateChannel: (channel: UpdateChannel) => void;
  setAutoCheckUpdate: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarWidth: (value: number) => void;
  setDevModeUnlocked: (value: boolean) => void;
  setChatWorkspacePath: (workspacePath: string) => void;
  setWorkspaceLabel: (workspacePath: string, label: string) => void;
  removeWorkspace: (workspacePath: string) => Promise<void>;
  setVoiceEnabled: (value: boolean) => void;
  setVoiceProfileId: (profileId: string) => void;
  setVoiceAutoRead: (value: boolean) => void;
  setVoiceAutoSend: (value: boolean) => void;
  setVoiceSpeed: (value: number) => void;
  setVoiceDepth: (value: number) => void;
  markSetupComplete: () => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: 'system' as Theme,
  language: resolveSupportedLanguage(typeof navigator !== 'undefined' ? navigator.language : undefined),
  startMinimized: false,
  launchAtStartup: false,
  telemetryEnabled: true,
  gatewayAutoStart: true,
  gatewayPort: 18789,
  proxyEnabled: false,
  proxyServer: '',
  proxyHttpServer: '',
  proxyHttpsServer: '',
  proxyAllServer: '',
  proxyBypassRules: '<local>;localhost;127.0.0.1;::1',
  updateChannel: 'stable' as UpdateChannel,
  autoCheckUpdate: true,
  sidebarCollapsed: false,
  sidebarWidth: 280,
  devModeUnlocked: false,
  chatWorkspacePath: DEFAULT_WORKSPACE_CWD,
  recentWorkspacePaths: [DEFAULT_WORKSPACE_CWD],
  workspaceLabels: {},
  voiceEnabled: true,
  voiceProfileId: DEFAULT_VOICE_PROFILE_ID,
  voiceAutoRead: true,
  voiceAutoSend: false,
  voiceSpeed: 1,
  voiceDepth: getVoiceProfile(DEFAULT_VOICE_PROFILE_ID).defaultDepth,
  setupComplete: false,
};

const clampSidebarWidth = (value: number) => Math.min(420, Math.max(220, Math.round(value)));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      init: async () => {
        try {
          const settings = await hostApi.settings.getAll();
          const resolvedLanguage = settings.language
            ? resolveSupportedLanguage(settings.language)
            : undefined;
          set((state) => ({
            ...state,
            ...settings,
            ...(resolvedLanguage ? { language: resolvedLanguage } : {}),
            ...(typeof settings.sidebarWidth === 'number'
              ? { sidebarWidth: clampSidebarWidth(settings.sidebarWidth) }
              : {}),
          }));
          if (resolvedLanguage) {
            i18n.changeLanguage(resolvedLanguage);
          }
        } catch {
          // Keep renderer-persisted settings as a fallback when the main
          // process store is not reachable.
        }
      },

      setTheme: (theme) => {
        set({ theme });
        void hostApi.settings.set('theme', theme).catch(() => { });
      },
      setLanguage: (language) => {
        const resolvedLanguage = resolveSupportedLanguage(language);
        i18n.changeLanguage(resolvedLanguage);
        set({ language: resolvedLanguage });
        void hostApi.settings.set('language', resolvedLanguage).catch(() => { });
      },
      setStartMinimized: (startMinimized) => set({ startMinimized }),
      setLaunchAtStartup: (launchAtStartup) => {
        set({ launchAtStartup });
        void hostApi.settings.set('launchAtStartup', launchAtStartup).catch(() => { });
      },
      setTelemetryEnabled: (telemetryEnabled) => {
        set({ telemetryEnabled });
        void hostApi.settings.set('telemetryEnabled', telemetryEnabled).catch(() => { });
      },
      setGatewayAutoStart: (gatewayAutoStart) => {
        set({ gatewayAutoStart });
        void hostApi.settings.set('gatewayAutoStart', gatewayAutoStart).catch(() => { });
      },
      setGatewayPort: (gatewayPort) => {
        set({ gatewayPort });
        void hostApi.settings.set('gatewayPort', gatewayPort).catch(() => { });
      },
      setProxyEnabled: (proxyEnabled) => set({ proxyEnabled }),
      setProxyServer: (proxyServer) => set({ proxyServer }),
      setProxyHttpServer: (proxyHttpServer) => set({ proxyHttpServer }),
      setProxyHttpsServer: (proxyHttpsServer) => set({ proxyHttpsServer }),
      setProxyAllServer: (proxyAllServer) => set({ proxyAllServer }),
      setProxyBypassRules: (proxyBypassRules) => set({ proxyBypassRules }),
      setUpdateChannel: (updateChannel) => set({ updateChannel }),
      setAutoCheckUpdate: (autoCheckUpdate) => {
        set({ autoCheckUpdate });
        void hostApi.settings.set('autoCheckUpdate', autoCheckUpdate).catch(() => { });
      },

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth: clampSidebarWidth(sidebarWidth) }),
      setDevModeUnlocked: (devModeUnlocked) => {
        set({ devModeUnlocked });
        void hostApi.settings.set('devModeUnlocked', devModeUnlocked).catch(() => { });
      },
      setChatWorkspacePath: (chatWorkspacePath) => {
        const normalized = normalizeWorkspacePath(chatWorkspacePath) ?? DEFAULT_WORKSPACE_CWD;
        set((state) => {
          const recentWorkspacePaths = [
            normalized,
            ...state.recentWorkspacePaths.filter((entry) => normalizeWorkspacePath(entry) !== normalized),
          ].slice(0, MAX_RECENT_WORKSPACES);
          const existingLabel = state.workspaceLabels[normalized]?.trim()
            || state.workspaceLabels[chatWorkspacePath.trim()]?.trim();
          const workspaceLabels = !isDefaultWorkspacePath(normalized) && !existingLabel
            ? {
              ...state.workspaceLabels,
              [normalized]: getWorkspaceDisplayLabel(
                normalized,
                '',
                state.workspaceLabels,
                [...state.recentWorkspacePaths, normalized],
              ),
            }
            : state.workspaceLabels;
          void hostApi.settings.setMany({
            chatWorkspacePath: normalized,
            recentWorkspacePaths,
            ...(workspaceLabels !== state.workspaceLabels ? { workspaceLabels } : {}),
          }).catch(() => { });
          return { chatWorkspacePath: normalized, recentWorkspacePaths, workspaceLabels };
        });
      },
      setWorkspaceLabel: (workspacePath, label) => {
        const normalizedPath = workspacePath.trim();
        const normalizedLabel = label.trim();
        if (!normalizedPath || !normalizedLabel) return;
        set((state) => {
          const workspaceLabels = {
            ...state.workspaceLabels,
            [normalizedPath]: normalizedLabel,
          };
          void hostApi.settings.setMany({ workspaceLabels }).catch(() => { });
          return { workspaceLabels };
        });
      },
      removeWorkspace: async (workspacePath) => {
        const target = normalizeWorkspacePath(workspacePath);
        if (!target) return;
        const isTarget = (candidate: string) => normalizeWorkspacePath(candidate) === target;
        const state = useSettingsStore.getState();
        const resetsGlobalWorkspace = isTarget(state.chatWorkspacePath);
        const recentWorkspacePaths = state.recentWorkspacePaths.filter((entry) => !isTarget(entry));
        if (
          resetsGlobalWorkspace
          && !recentWorkspacePaths.some((entry) => normalizeWorkspacePath(entry) === DEFAULT_WORKSPACE_CWD)
        ) {
          recentWorkspacePaths.unshift(DEFAULT_WORKSPACE_CWD);
        }
        const workspaceLabels = Object.fromEntries(
          Object.entries(state.workspaceLabels).filter(([path]) => !isTarget(path)),
        );
        const patch = {
          chatWorkspacePath: resetsGlobalWorkspace ? DEFAULT_WORKSPACE_CWD : state.chatWorkspacePath,
          recentWorkspacePaths,
          workspaceLabels,
        };
        set(patch);
        await hostApi.settings.setMany(patch);
      },
      setVoiceEnabled: (voiceEnabled) => {
        set({ voiceEnabled });
        void hostApi.settings.set('voiceEnabled', voiceEnabled).catch(() => { });
      },
      setVoiceProfileId: (voiceProfileId) => {
        const profile = getVoiceProfile(voiceProfileId);
        set({ voiceProfileId: profile.id, voiceDepth: profile.defaultDepth });
        void hostApi.settings.setMany({
          voiceProfileId: profile.id,
          voiceDepth: profile.defaultDepth,
        }).catch(() => { });
      },
      setVoiceAutoRead: (voiceAutoRead) => {
        set({ voiceAutoRead });
        void hostApi.settings.set('voiceAutoRead', voiceAutoRead).catch(() => { });
      },
      setVoiceAutoSend: (voiceAutoSend) => {
        set({ voiceAutoSend });
        void hostApi.settings.set('voiceAutoSend', voiceAutoSend).catch(() => { });
      },
      setVoiceSpeed: (voiceSpeed) => {
        const safeSpeed = Math.min(1.4, Math.max(0.6, voiceSpeed));
        set({ voiceSpeed: safeSpeed });
        void hostApi.settings.set('voiceSpeed', safeSpeed).catch(() => { });
      },
      setVoiceDepth: (voiceDepth) => {
        const safeDepth = Math.min(100, Math.max(0, Math.round(voiceDepth)));
        set({ voiceDepth: safeDepth });
        void hostApi.settings.set('voiceDepth', safeDepth).catch(() => { });
      },
      markSetupComplete: () => set({ setupComplete: true }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'clawx-settings',
    }
  )
);
