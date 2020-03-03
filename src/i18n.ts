import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { appState, resoreAppState } from './AppState';


export const i18_langs = ["ru", "en"];

// the translations
// (tip move them in a JSON file and import them)
const resources = {
    ru: {
        translation: {
            // common
            "api_prefix": "api-префикс",
            "database": "база данных",
            "databases": "базы данных",
            "description": "описание",
            "server_type": "тип сервера",
            "server host": "адрес сервера (URL)",
            "database_name": "имя базы данных",
            "api_name": "api-имя",
            "login": "логин",
            "actions": "действия",
            "delete": "удал.",
            "edit": "изм.",

            // validation rules
            "bad_identifier": "{{name}} может содержать только латин. буквы, цифры, _ и начинаться с буквы или _",
            "cannot_be_empty": "{{name}} не может быть пустым",

            // DatabasesListPage
            "API_databases_list": "список баз данных для API",
            "add_new_database": "добавить базу даных",
        }
    },

    en: {
        translation: {
            // common
            "api_prefix": "api prefix",
            "database": "database",
            "databases": "databases",
            "description": "description",
            "server_type": "server type",
            "server_host": "server host",
            "database_name": "database name",
            "api_name": "api name",
            "login": "login",
            "actions": "actions",
            "delete": "delete",
            "edit": "edit",

            // validation rules
            "bad_identifier": "{{name}} can only contain latin. letters, numbers, underscore and begin with a letter or underscore",
            "cannot_be_empty": "{{name}} cannot be empty",

            // DatabasesListPage
            "API_databases_list": "API databases list",
            "add_new_database": "add new database",

        }
    }
};

/*

*/

resoreAppState();

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: appState.lang,

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

