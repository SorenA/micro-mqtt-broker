/**
 * Auth Provider - API
 * Uses a remote API
 */

const axios = require('axios');

let apiEndpoint = null;
let apiToken = null;

module.exports = {
  initalize: function (endpoint, token) {
    apiEndpoint = endpoint;
    apiToken = token;
    console.info(`API Auth Provider: Configured with endpoint '${apiEndpoint}'`);
  },
  isAuthenticationValid: function (mqttClient, username = '', password = '') {
    return new Promise((resolve, reject) => {
      // Construct payload
      let payload = {
        username: username.toString(),
        password: password.toString(),
      };

      if (apiToken) {
        payload.authToken = apiToken;
      }

      axios.post(apiEndpoint, payload)
        .then(response => {
          if (response.status === 200 && response.data.isAuthenticated === true) {
            // Authentication successful, save ACL to client object for later fetching
            mqttClient.authData = {
              username: username,
              subscribeAccess: response.data.subscribeAccess,
              publishAccess: response.data.publishAccess,
            };

            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(err => {
          console.info('API Auth Provider: Error while authenticating');
          console.info(err);
          resolve(false);
        });
    });
  },
  getSubscribeAccessControlList: function (mqttClient) {
    // Fetch from client object
    return mqttClient.authData.subscribeAccess;
  },
  getPublishAccessControlList: function (mqttClient) {
    // Fetch from client object
    return mqttClient.authData.publishAccess;
  },
};
