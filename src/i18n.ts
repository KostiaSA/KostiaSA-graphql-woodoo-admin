import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { appState, resoreAppState } from './AppState';


//import enEN from 'antd/es/locale/en_EN';
import ruRU from 'antd/es/locale/ru_RU';

export const i18_langs = ["ru", "en"];


export function getAntdLocale(lang: string): any {
    switch (lang) {
        case "ru": return ruRU;
        case "en": return undefined;
        default: throw new Error("getAntdLocale(): todo for lang " + lang);
    }
}

export function getAntdValidatorMessages(lang: string): any {
    switch (lang) {
        case "ru": return validatorMessages_ru();
        case "en": return undefined;
        default: throw new Error("getAntdValidationMessages(): todo for lang " + lang);
    }
}


function validatorMessages_ru(): any {

    const typeTemplate = "'${name}' требуется тип ${type}";

    return {
        default: "неверно заполнено поле '${name}'",
        required: "'${name}' надо заполнить",
        enum: "'${name}' должно быть одно из [${enum}]",
        whitespace: "'${name}' надо заполнить",
        date: {
            format: "'${name}' неверный формат даты",
            parse: "'${name}' неверная дата",
            invalid: "'${name}' неверная дата",
        },
        types: {
            string: typeTemplate,
            method: typeTemplate,
            array: typeTemplate,
            object: typeTemplate,
            number: typeTemplate,
            date: typeTemplate,
            boolean: typeTemplate,
            integer: typeTemplate,
            float: typeTemplate,
            regexp: typeTemplate,
            email: typeTemplate,
            url: typeTemplate,
            hex: typeTemplate,
        },
        string: {
            len: "'${name}' длина строки должна быть ровно ${len} симв.",
            min: "'${name}' длина строки должна быть не менее ${min} симв.",
            max: "'${name}' длина строки должна быть не более ${max} симв.",
            range: "'${name}' длина строки должна быть от ${min} до ${max} симв.",
        },
        number: {
            len: "'${name}' должен быть равно ${len}",
            min: "'${name}' должен быть не менее ${min}",
            max: "'${name}' должен быть не более ${max}",
            range: "'${name}' должен быть от ${min} до ${max}",
        },
        array: {
            len: "'${name}' длина массива должна быть ровно ${len}",
            min: "'${name}' длина массива не должна быть меньше ${min}",
            max: "'${name}' длина массива не должна быть больше ${max}",
            range: "'${name}' длина массива не должна быть от ${min} до ${max}",
        },
        pattern: {
            mismatch: "'${name}' не подходит по шаблону ${pattern}",
        },
    };
}
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
            "Yes": "Да",
            "No": "Нет",

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
            "delete_database?": "удалить базу даных '{{name}}' и все ее настройки?",

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
            "Yes": "Yes",
            "No": "No",

            // validation rules
            "bad_identifier": "{{name}} can only contain latin. letters, numbers, underscore and begin with a letter or underscore",
            "cannot_be_empty": "{{name}} cannot be empty",
            "max_length_exceeded": "maximum length ({{length}}) exceeded for {{name}}",


            // DatabasesListPage
            "API_databases_list": "API databases list",
            "add_new_database": "add new database",
            "Adding_new_database": "Adding new database",
            "Editing_database": "Editing database",
            "API_GRAPHQL_info": "GraphQL API information",
            "connection_options": "connection options",
            "check_connection": "check connection",
            "delete_database?": "delete database '{{name}}' and all its settings?",

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

