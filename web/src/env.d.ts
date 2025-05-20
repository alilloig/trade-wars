   /// <reference types="vite/client" />

   interface ImportMetaEnv {
    readonly VITE_TRADE_WARS_ADDRESS_LOCAL: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }