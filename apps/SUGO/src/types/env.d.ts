/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUGO_BackTS: string; // Declara la variable de entorno
    // Agrega aquí otras variables de entorno si las necesitas
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
