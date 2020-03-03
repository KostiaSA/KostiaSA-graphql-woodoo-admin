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
            "server_host": "адрес сервера (URL)",
            "server_port": "порт сервера",
            "database_name": "имя базы данных",
            "api_name": "api-имя",
            "db_name": "имя базы",
            "login": "логин",
            "password": "пароль",
            "actions": "действия",
            "delete": "удал.",
            "edit": "изм.",
            "Save": "Сохранить",
            "Cancel": "Отмена",
            "Close": "Закрыть",

            // validation rules
            "bad_identifier": "{{name}} может содержать только латин. буквы, цифры, _ и начинаться с буквы или _",
            "cannot_be_empty": "{{name}} не может быть пустым",
            "max_length_exceeded": "{{name}}: превышена максимальная длина {{length}}",

            // DatabasesListPage
            "API_databases_list": "список баз данных для API",
            "add_new_database": "добавить базу даных",
            "Adding_new_database": "Добавление базы данных",
            "Editing_database": "Редактирование базы данных",
            "API_GRAPHQL_info": "информация для API GraphQL",
            "connection_options": "параметры подключения",
            "check_connection": "проверка подключения",
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
            "server_port": "server port",
            "database_name": "database name",
            "api_name": "api name",
            "db_name": "db name",
            "login": "login",
            "password": "password",
            "actions": "actions",
            "delete": "delete",
            "edit": "edit",
            "Save": "Save",
            "Cancel": "Cancel",
            "Close": "Close",

            // validation rules
            "bad_identifier": "{{name}} can only contain latin. letters, numbers, underscore and begin with a letter or underscore",
            "cannot_be_empty": "{{name}} cannot be empty",
            "max_length_exceeded": "maximum length ({{length}}) exceeded for {{name}}",


            // DatabasesListPage
            "API_databases_list": "API databases list",
            "add_new_database": "add new database",
            "Adding_new_database": "Adding new_database",
            "Editing_database": "Editing database",
            "API_GRAPHQL_info": "GraphQL API information",
            "connection_options": "connection options",
            "check_connection": "check connection",

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

