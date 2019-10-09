# Micro MQTT Broker

Micro MQTT broker based on Mosca MQTT with TLS support and authentication using multiple providers.

## Docker & Kubernetes

The broker was built with Kubernetes in mind, under the directory `/k8s` are sample deployment configurations.

## Related projects

[Micro MQTT Auth API Microservice](https://github.com/SorenA/micro-mqtt-auth-api-microservice) - Implementation of an API microservice that can be used with the API auth provider.

[Micro MQTT Handshake API Microservice](https://github.com/SorenA/micro-mqtt-handshake-api-microservice) - Implementation of an API microservice that can be used to register and handshake new devices on-demand.

## Configuration

Configuration is done through environment variables, in development the .env file can be used.

Defaults for environment variables:

```env
TLS_ENABLE=false
TLS_KEY_FILE=/opt/mqtt/cert.key
TLS_CERT_FILE=/opt/mqtt/cert.cert

AUTH_PROVIDER=NONE
AUTH_YAML_FILE=/opt/mqtt/auth.yaml
AUTH_JSON_FILE=/opt/mqtt/auth.json
AUTH_API_ENDPOINT=
AUTH_API_TOKEN=
```

### TLS

The connections can be secured using TLS by providing a certificate:

```env
TLS_ENABLE=true
TLS_KEY_FILE=/opt/mqtt/cert.key
TLS_CERT_FILE=/opt/mqtt/cert.cert
```

### Authentication and autorization configuration

Multiple methods of authentication are supported, depending on use case, and a custom solution can easily be implemented using the API provider.

For all providers, the ACL supports fixed topics along with single-level and multi-level wildcards both in read and write access lists.

Examples:

```yaml
"sensors/1/actions/restart" # Fixed topic
"sensors/1/metrics/#" # Multi-level wildcard topic
"sensors/+/actions/restart" # Single-level wildcard topic
"sensors/+/metrics/#" # Multi & single-level wildcard topic
```

#### Public access

Configure environment variables:

```env
AUTH_PROVIDER=NONE
```

Accepts all connections and grants everyone full permissions, not recommended.

#### YAML File

Configure environment variables:

```env
AUTH_PROVIDER=YAML
AUTH_YAML_FILE=/opt/mqtt/auth.yaml
```

Sample file:

```yaml
---
login: "sample-admin:$apr1$.qu4F5HV$q8Rw/DrkmAizalGeHi56t0" # .htpasswd format
subscribeAccess:
- "#" # Full access
publishAccess:
- "#" # Full access
---
login: "sample-user:$apr1$1QzP30DN$Do9gE3Mvg2SrVJHuRIOjQ/" # .htpasswd format
subscribeAccess:
- "sensors/1/metrics/#"
publishAccess:
- "sensors/+/actions/restart"
- "sensors/+/metrics/#"
```

#### JSON File

Configure environment variables:

```env
AUTH_PROVIDER=JSON
AUTH_JSON_FILE=/opt/mqtt/auth.json
```

Sample file:

```js
[
    {
        "login": "sample-admin:$apr1$.qu4F5HV$q8Rw/DrkmAizalGeHi56t0", // .htpasswd format
        "subscribeAccess": [
            "#"
        ],
        "publishAccess": [
            "#"
        ]
    },
    {
        "login": "sample-user:$apr1$1QzP30DN$Do9gE3Mvg2SrVJHuRIOjQ/", // .htpasswd format
        "subscribeAccess": [
            "sensors/1/metrics/#"
        ],
        "publishAccess": [
            "sensors/+/actions/restart",
            "sensors/+/metrics/#"
        ]
    }
]
```

#### API

Configure environment variables:

```env
AUTH_PROVIDER=API
AUTH_API_ENDPOINT=https://example.com/api/micro-mqtt/auth
AUTH_API_TOKEN=foo
```

`AUTH_API_TOKEN` is optional, if set, the value will be relayed to the endpoint in the payload.

Sample POST request to api endpoint defined in environment variable:

`POST https://example.com/api/micro-mqtt/auth`

```js
{
    "authToken": "foo", // Only present if AUTH_API_TOKEN is set in environment variables
    "username": "sample-user", // .htpasswd format
    "password": "sample-password" // Raw password
}
```

Response format required from API:

```js
{
    "isAuthenticated": true, // Boolean, true if credentials matched, otherwise false
    "subscribeAccess": [ // String array, only applicable if authenticated
        "#"
    ],
    "publishAccess": [ // String array, only applicable if authenticated
        "#"
    ]
}
```

## Development

Requirements:

- NodeJS 7 (Required by Mosca)

Recommended:

- NVM or similar to change between Node versions (Version 7 is quite old)

Install dependencies using `npm i` from `/src` directory, it will show errors during install, these can mostly be ignored.

Run local version using `npm run dev` from `/src` directory.
