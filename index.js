"use strict";

const NestedError = require('nested-error-stacks');

const defaultProperties = [
    'stackTraceLimit', 'cause', 'code', 'message', 'stack', 'address',
    'dest', 'errno', 'info', 'path', 'port', 'syscall', 'opensslErrorStack',
    'function', 'library', 'reason'
];

/**
 * Serializes an error into a JSON-compatible format, with optional sanitization.
 * @param {Error | NestedError | object} error - The error to serialize.
 * @param {boolean} sanitize - Whether to remove sensitive fields.
 * @param {Array<string>} properties - Properties to include in serialization.
 * @returns {object} The serialized error.
 */
const serializeError = (error, sanitize = false, properties = defaultProperties) => {
    if (error === null || error === undefined) return error;

    const result = {};
    const includeProperties = sanitize
        ? properties.filter(prop => !['address', 'path'].includes(prop))
        : properties;

    includeProperties.forEach(prop => {
        if (error?.[prop] !== undefined) {
            result[prop] = error[prop];
        }
    });

    if (error instanceof NestedError) {
        result.type = 'NestedError';
        if (error.nested) result.nested = serializeError(error.nested, sanitize, properties);
    } else if (error instanceof Error) {
        result.type = 'Error';
    } else if (error instanceof Object) {
        result.type = 'Object';
        Object.assign(result, error);
    } else {
        result.type = 'Default';
        result.instance = error;
    }

    return result;
};

/**
 * Deserializes a JSON-compatible error back into an Error object.
 * @param {object} json - The serialized error JSON.
 * @returns {Error | NestedError | object | any} The deserialized error.
 */
const deserializeError = (json) => {
    if (json === null || json === undefined) return json;

    switch (json.type) {
        case 'NestedError': {
            const result = new NestedError();
            deserializeCommonProperties(json, result);
            if (json.nested) result.nested = deserializeError(json.nested);
            return result;
        }
        case 'Error': {
            const result = new Error();
            deserializeCommonProperties(json, result);
            return result;
        }
        case 'Object': {
            return { ...json };
        }
        case 'Default': {
            return json.instance;
        }
    }
};

/**
 * Helper to apply common properties to a deserialized error object.
 * @param {object} json - The serialized error JSON.
 * @param {Error} result - The deserialized error instance.
 */
const deserializeCommonProperties = (json, result) => {
    defaultProperties.forEach(prop => {
        if (json[prop] !== undefined) {
            result[prop] = json[prop];
        }
    });
};

/**
 * Creates a readable text format from a serialized error JSON.
 * @param {object} json - The serialized error JSON.
 * @param {number} level - Indentation level for nested errors.
 * @returns {string} The formatted error message.
 */
const serializedErrorText = (json, level = 0) => {
    if (json === null || json === undefined) return '';

    const indent = ' '.repeat(level * 2);
    const result = [];

    switch (json.type) {
        case 'NestedError':
        case 'Error': {
            if (json.message) result.push(indent + json.message.trim());
            if (json.type === 'NestedError' && json.nested) {
                result.push(serializedErrorText(json.nested, level + 1));
            }
            break;
        }
        case 'Object': {
            result.push(indent + JSON.stringify(json));
            break;
        }
        case 'Default': {
            result.push(indent + String(json));
            break;
        }
    }

    return result.join('\n');
};

/**
 * Wraps `serializedErrorText` to serialize and format an Error object.
 * @param {Error} error - The error object.
 * @returns {string} The formatted error message.
 */
const errorText = (error) => serializedErrorText(serializeError(error));

/**
 * Provides debug information for serialized error properties.
 * @param {object} json - The serialized error JSON.
 * @returns {string} The formatted debug information.
 */
const debugSerializedError = (json) => {
    if (json === null || json === undefined) return '';

    const result = [];
    const stack = [json];

    while (stack.length) {
        const current = stack.pop();
        defaultProperties.forEach(prop => {
            if (current[prop] !== undefined) {
                result.push(`${prop}: ${current[prop]}`);
            }
        });

        if (current.type === 'NestedError' && current.nested) {
            stack.push(current.nested);
        }
    }
    return result.join('\n');
};

/**
 * Wraps `debugSerializedError` to serialize and format an Error object for debugging.
 * @param {Error} error - The error object.
 * @returns {string} The formatted debug information.
 */
const debugError = (error) => debugSerializedError(serializeError(error));

module.exports = {
    serializeError,
    deserializeError,
    serializedErrorText,
    errorText,
    debugSerializedError,
    debugError
};
