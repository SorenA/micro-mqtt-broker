/**
 * Auth Provider - None
 * Gives full access to everyone
 */

module.exports = {
  isAuthenticationValid: function (mqttClient, username, password) {
    return true;
  },
  getSubscribeAccessControlList: function (mqttClient) {
    return [
      '#',
    ];
  },
  getPublishAccessControlList: function (mqttClient) {
    return [
      '#',
    ];
  },
};
