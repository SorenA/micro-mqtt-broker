const mosca = require('mosca');

/**
 * Configuration - TLS
 */
const isTlsEnabled = (process.env.TLS_ENABLE || 'false') == 'true';
const tlsKeyFile = process.env.TLS_KEY_FILE || '/opt/mqtt/cert.key';
const tlsCertFile = process.env.TLS_CERT_FILE || '/opt/mqtt/cert.cert';

/**
 * Configuration - Auth
 */
const authProvider = process.env.AUTH_PROVIDER || 'NONE';
const authYamlFile = process.env.AUTH_YAML_FILE || '/opt/mqtt/auth.yaml';
const authJsonFile = process.env.AUTH_JSON_FILE || '/opt/mqtt/auth.json';
const authApiEndpoint = process.env.AUTH_API_ENDPOINT || '';
const authApiToken = process.env.AUTH_API_TOKEN || '';