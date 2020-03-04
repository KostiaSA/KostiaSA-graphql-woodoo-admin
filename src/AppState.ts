import { deepMerge } from "./utils/deepMerge";

export interface IAppState {
    lang: string;
    ui_disabled: boolean;
}

export var appState: IAppState;

export function getDefaultAppState(): IAppState {
    return {
        lang: "ru",
        ui_disabled: false
    }
}

export function storeAppState() {
    localStorage.setItem("voodoo:AppState", JSON.stringify(appState));
}

export function resoreAppState() {
    appState = deepMerge(appState, JSON.parse(localStorage.getItem("voodoo:AppState") || "{}"));
}

export function initAppState(initAppState: IAppState) {
    appState = initAppState;
}