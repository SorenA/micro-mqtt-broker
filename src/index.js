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

/**
 * Event: On Server Ready - Broker is started and ready for connections
 */
function onServerReady() {
  console.info(`MQTT Broker: Ready for connections.`);
};

/**
 * Event: On Client Connected - Fired when a client has connected to the broker
 */
const onClientConnected = function (client) {
  console.info(`Client ${client.id}: Connected`);
};

/**
 * Event: On Client Disconnected - Fired when a client has disconnected from the broker
 */
const onClientDisconnected = function (client) {
  console.info(`Client ${client.id}: Disconnected`);
};

/**
 * MQTT Event: On Message Published - Fired when any message is published
 */
const onMessagePublished = function (message, client) {
  // Skip system messages from being logged
  if (!message.topic.startsWith('$SYS')) {
    console.info(`Client ${client.id}: Publish: ${message.topic}: ${message.payload.toString()}`);
  }
};

/**
 * Setup broker
 */
const moscaConfig = {
  port: 1883,
};

if (isTlsEnabled == true) {
  serverConfig.secure = {
    port: 8883,
    keyPath: tlsKeyFile,
    certPath: tlsCertFile
  };
}
const server = new mosca.Server(moscaConfig);

/**
 * Attach events
 */
server.on('ready', onServerReady);
server.on('clientConnected', onClientConnected);
server.on('clientDisconnected', onClientDisconnected);
server.on('published', onMessagePublished);
