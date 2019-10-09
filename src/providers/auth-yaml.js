/**
 * Auth Provider - Yaml
 * Uses configuration from yaml file
 */

const fs = require('fs');
const YAML = require('yaml');
const htpasswdUtil = require('htpasswd/src/utils');

let authUsers = [];


module.exports = {
  initalize: function(configFile) {
    // Read config file contents
    const configContents = fs.readFileSync(configFile, 'utf8');
    authUsers = YAML.parse(configContents);
    console.info(`YAML Auth Provider: Loaded ${authUsers.length} users from file`);
  },
  isAuthenticationValid: function (mqttClient, username, password) {
    for(const authUser of authUsers) {
      // Extract and check username
      const authUserLoginFragments = authUser.login.split(':');
      if (authUserLoginFragments[0] === username) {
        // Username matches, check password digest
        try {
          if (htpasswdUtil.verify(authUserLoginFragments[1], password)) {
            // We have a match, save ACL to client object for later fetching
            mqttClient.authData = {
              username: username,
              subscribeAccess: authUser.subscribeAccess,
              publishAccess: authUser.publishAccess,
            };
            console.log(mqttClient.authData);

            return true;
          }
        } catch (ex) {
          // Do nothing, password most likely invalid
        }
      }

    }
    return false;
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
