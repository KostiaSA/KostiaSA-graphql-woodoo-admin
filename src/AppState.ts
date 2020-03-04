import { deepMerge } from "./utils/deepMerge";

export interface IAppState {
    lang: string;
    ui_disabled: boolean;
}

export var appState: IAppState;

export function getDefaultAppState(): IAppState {
    let ret = {
        lang: "ru",
        ui_disabled: false
    };
    ret = deepMerge(ret, JSON.parse(localStorage.getItem("voodoo:AppState") || "{}"));
    return ret;
}

export function storeAppState() {
    localStorage.setItem("voodoo:AppState", JSON.stringify(appState));
}

// export function resoreAppState() {
//     appState = deepMerge(appState, JSON.parse(localStorage.getItem("voodoo:AppState") || "{}"));
// }

export function initAppState(initAppState: IAppState) {
    appState = initAppState;
}