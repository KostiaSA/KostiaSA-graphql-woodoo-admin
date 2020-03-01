import { deepMerge } from "./utils/deepMerge";

export interface IAppState {
    lang: string;
}

export var appState: IAppState = {
    lang: "ru",
}

export function storeAppState() {
    localStorage.setItem("voodoo:AppState", JSON.stringify(appState));
}

export function resoreAppState() {
    appState = deepMerge(appState, JSON.parse(localStorage.getItem("voodoo:AppState") || "{}"));
}