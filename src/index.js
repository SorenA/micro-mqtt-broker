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

// Select auth provider
console.info(`Using auth provider: ${authProvider}`);
let activeAuthProvider = null;
switch (authProvider) {
  case 'NONE':
    activeAuthProvider = require('./providers/auth-none');
    break;
  case 'YAML':
    activeAuthProvider = require('./providers/auth-yaml');
    activeAuthProvider.initalize(authYamlFile);
    break;
  case 'JSON':
    activeAuthProvider = require('./providers/auth-json');
    activeAuthProvider.initalize(authJsonFile);
    break;
  default:
    throw new Error(`Invalid provider in AUTH_PROVIDER: ${authProvider}`);
}

/**
 * Method: Is ACL Matched - Checks if a topic matches the ACL provided
 */
function isAclMatched(accessControlList, topic) {
  // Check ACL
  for (const accessControlEntry of accessControlList) {
    // Check for exact topic match
    if (accessControlEntry === topic) {
      return true;
    }

    // Check for single and multi-level matches using regex
    if (topic.match('^' + accessControlEntry.replace('+', '[^/]+').replace('#', '.+') + '$')) {
      return true;
    }
  }

  // No match
  return false;
}

/**
 * Callback: Authenticate - Called when a client tries to authenticate on connect
 */
const cbAuthenticate = async function (client, username, password, callback) {
  let isAuthenticated = activeAuthProvider.isAuthenticationValid(client, username, password);

  if (isAuthenticated) {
    console.info(`Client ${client.id}: Accepted authentication - Connected as user ${username}`);
  } else {
    console.info(`Client ${client.id}: Rejected authentication - Invalid credentials`);
  }

  callback(null, isAuthenticated);
}

/**
 * Callback: Authorize Publish - Called when a client attempts to publish a message
 */
const cbAuthorizePublish = function (client, topic, payload, callback) {
  const accessControlList = activeAuthProvider.getPublishAccessControlList(client);
  const isAuthorized = isAclMatched(accessControlList, topic);

  if (isAuthorized) {
    console.info(`Client ${client.id}: Accepted publish: ${topic}`);
  } else {
    console.info(`Client ${client.id}: Rejected publish: ${topic}`);
  }

  callback(null, isAuthorized);
};

/**
 * Callback: Authorize Subscribe - Called when a client attempts to subscribe to a topic
 */
const cbAuthorizeSubscribe = function (client, topic, callback) {
  const accessControlList = activeAuthProvider.getSubscribeAccessControlList(client);
  const isAuthorized = isAclMatched(accessControlList, topic);

  if (isAuthorized) {
    console.info(`Client ${client.id}: Accepted subscription: ${topic}`);
  } else {
    console.info(`Client ${client.id}: Rejected subscription: ${topic}`);
  }

  callback(null, isAuthorized);
};

/**
 * Event: On Server Ready - Broker is started and ready for connections
 */
function onServerReady() {
  console.info(`MQTT Broker: Ready for connections.`);

  // Register auth callbacks
  server.authenticate = cbAuthenticate;
  server.authorizePublish = cbAuthorizePublish;
  server.authorizeSubscribe = cbAuthorizeSubscribe;

  console.info(`MQTT Broker: Configuration complete.`);
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

/**
 * Process Event: SIGINT - Exit process gracefully
 */
process.on('SIGINT', function() {
  console.info('MQTT Broker: SIGINT received, shutting down');
  server.close();
  process.exit();
});
