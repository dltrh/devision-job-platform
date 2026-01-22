interface ImportMetaEnv {
    readonly VITE_DEBUG_PRODUCTION?: string;
    readonly NODE_ENV?: string;
    readonly DEV?: boolean;
    VITE_NODE_ENV?: string;
}

interface ImportMeta {
    glob: Function;

    readonly env: ImportMetaEnv;
}
