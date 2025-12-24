/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface Window {
  aistudio?: {
    hasSelectedApiKey?: () => Promise<boolean>;
    openSelectKey?: () => Promise<void>;
  };
  electronAPI?: {
    platform: string;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    db?: {
      saveConfig: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;
      getConfig: (key: string) => Promise<{ success: boolean; value: string | null; error?: string }>;
      deleteConfig: (key: string) => Promise<{ success: boolean; error?: string }>;
      getAllConfig: () => Promise<{ success: boolean; config: Record<string, string>; error?: string }>;
    };
    app?: {
      getLocale: () => Promise<string>;
    };
  };
}
