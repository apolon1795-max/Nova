/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEAD_ENDPOINT?: string;
  readonly VITE_PRIVACY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
