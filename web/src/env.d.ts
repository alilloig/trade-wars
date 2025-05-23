   /// <reference types="vite/client" />

   interface ImportMetaEnv {
    readonly VITE_TRADE_WARS_ID_DEV: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }