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
TLS_KEY_FILE=./tls/cert.key
TLS_CERT_FILE=./tls/cert.cert

AUTH_PROVIDER=NONE
```

### TLS

The connections can be secured using TLS by providing a certificate:

```env
TLS_ENABLE=true
TLS_KEY_FILE=./tls/cert.key
TLS_CERT_FILE=./tls/cert.cert
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
AUTH_YAML_FILE=/data/auth.yaml
```

Sample file:

```yaml
---
login: "sample-admin:$apr1$.qu4F5HV$q8Rw/DrkmAizalGeHi56t0" # .htpasswd format
readAccess:
- "#" # Full access
writeAccess:
- "#" # Full access
---
login: "sample-user:$apr1$1QzP30DN$Do9gE3Mvg2SrVJHuRIOjQ/" # .htpasswd format
readAccess:
- "sensors/1/metrics/#"
writeAccess:
- "sensors/+/actions/restart"
- "sensors/+/metrics/#"
```

#### JSON File

Configure environment variables:

```env
AUTH_PROVIDER=JSON
AUTH_JSON_FILE=/data/auth.json
```

Sample file:

```js
[
    {
        "login": "sample-admin:$apr1$.qu4F5HV$q8Rw/DrkmAizalGeHi56t0", // .htpasswd format
        "readAccess": [
            "#"
        ],
        "writeAccess": [
            "#"
        ]
    },
    {
        "login": "sample-user:$apr1$1QzP30DN$Do9gE3Mvg2SrVJHuRIOjQ/", // .htpasswd format
        "readAccess": [
            "sensors/1/metrics/#"
        ],
        "writeAccess": [
            "sensors/+/actions/restart",
            "sensors/+/metrics/#"
        ]
    },
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
    "readAccess": [ // String array, only applicable if authenticated
        "#"
    ],
    "writeAccess": [ // String array, only applicable if authenticated
        "#"
    ]
}
```
