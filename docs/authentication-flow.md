# Diagrama de Flujo de Autenticación

Este diagrama muestra cómo funciona la autenticación OAuth 2.0 en la aplicación:

```mermaid
sequenceDiagram
    participant App as Vue App
    participant Vuex as Vuex Store
    participant OAuth as OAuth API
    participant Blizzard as Battle.net API
    participant Components as Vue Components

    Note over App: Aplicación se inicia
    App->>Vuex: dispatch('oauth/getToken')
    Vuex->>Vuex: SET_LOADING(true)
    
    Vuex->>OAuth: getToken()
    OAuth->>Blizzard: POST /oauth/token<br/>(client_credentials)
    
    alt Autenticación exitosa
        Blizzard-->>OAuth: { access_token: "..." }
        OAuth-->>Vuex: Promise resolve(data)
        Vuex->>Vuex: SET_ACCESS_TOKEN(data.access_token)
    else Error de autenticación
        Blizzard-->>OAuth: Error 401/429/500
        OAuth-->>Vuex: Promise reject(error)
        Vuex->>Vuex: SET_ACCESS_TOKEN(null)
        Note over Vuex: Log del error
    end
    
    Vuex->>Vuex: SET_LOADING(false)
    
    Note over Components: Componentes listos para usar API
    Components->>Vuex: access token desde state
    Components->>Blizzard: API calls con token
```

## Pasos del Flujo

1. **Inicio de la aplicación**: La Vue app se inicializa y llama al método `init()`
2. **Solicitud de token**: Se dispara la acción `oauth/getToken` en Vuex
3. **Estado de carga**: Se activa el indicador de loading
4. **Petición OAuth**: Se hace POST a Battle.net con las credenciales de cliente
5. **Respuesta exitosa**: Se guarda el token en el estado de Vuex
6. **Error**: Se limpia el token y se registra el error
7. **Finalización**: Se desactiva el indicador de loading
8. **Uso del token**: Los componentes pueden hacer llamadas autenticadas a la API