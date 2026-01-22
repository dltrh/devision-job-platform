const loadModules = (modules: Record<string, any>, hasDefault = false) =>
    Object.entries(modules).map(([path, mod]) => {
        const parts = path.split("/");
        return {
            name: parts.at(-1)!.replace(".js", "").toUpperCase(),
            key: parts.at(-2)!,
            data: hasDefault ? mod.default : mod,
        };
    });

const rawActions = loadModules(
    import.meta.glob("./**/actions.ts", { eager: true }),
    true,
);

const rawTypes = loadModules(
    import.meta.glob("./**/types.ts", { eager: true }),
    false,
);

const rawReducers = loadModules(
    import.meta.glob("./**/reducer.ts", { eager: true }),
    true,
);

const rawSagas = loadModules(
    import.meta.glob("./**/saga.ts", { eager: true }),
    false,
);

// Final exports
export const actions = rawActions.reduce((p, e) => ({ ...p, ...e.data }), {});
export const types = rawTypes.reduce((p, e) => ({ ...p, ...e.data }), {});
export const reducers = rawReducers.reduce(
    (p, e) => ({ ...p, [e.key]: e.data }),
    {},
);
export const sagas = rawSagas.reduce((p, e) => ({ ...p, ...e.data }), {});
