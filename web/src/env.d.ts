/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRADE_WARS_PKG_DEV: string
  readonly VITE_TRADE_WARS_ID_DEV: string
  readonly VITE_TRADE_WARS_INFO_DEV: string
  readonly VITE_ERB_SOURCE_ID_DEV: string
  readonly VITE_LAN_SOURCE_ID_DEV: string
  readonly VITE_THO_SOURCE_ID_DEV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}