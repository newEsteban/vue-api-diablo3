# Autenticación en el Proyecto Vue API Diablo 3

Este documento explica cómo funciona la autenticación en este proyecto que consume la API de Diablo 3 de Blizzard.

## Resumen del Sistema de Autenticación

El proyecto utiliza **OAuth 2.0 con Client Credentials Flow** para autenticarse con la API de Blizzard Battle.net. Este es un flujo de autenticación server-to-server que permite a la aplicación obtener un token de acceso para realizar consultas a la API de Diablo 3.

## Flujo de Autenticación

### 1. Configuración Inicial

La autenticación requiere credenciales de cliente que se obtienen registrando una aplicación en el [Portal de Desarrolladores de Blizzard](https://develop.battle.net/):

```env
# Variables de entorno en .env
VUE_APP_CLIENT_ID=tu_client_id_aqui
VUE_APP_CLIENT_SECRET=tu_client_secret_aqui
```

**⚠️ Importante:** Estas credenciales deben mantenerse privadas y no deben exponerse públicamente.

### 2. Obtención del Token (src/api/oauth.js)

```javascript
// Configuración del endpoint OAuth
const region = 'eu'
const API_URL = `https://${region}.battle.net/oauth/token`

function getToken () {
  // Crear FormData con el tipo de grant
  const body = new FormData()
  body.append('grant_type', 'client_credentials')

  // Configuración de la petición
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Autenticación HTTP Basic con las credenciales de cliente
    auth: { 
      username: clientId, 
      password: clientSecret 
    }
  }

  // Petición POST al endpoint de OAuth
  return post(API_URL, body, config)
}
```

### 3. Gestión del Estado con Vuex (src/store/modules/oauth.js)

El token se almacena y gestiona usando Vuex:

```javascript
export default {
  namespaced: true,
  state: {
    accessToken: null  // Token de acceso actual
  },
  mutations: {
    SET_ACCESS_TOKEN (state, payload) {
      state.accessToken = payload
    }
  },
  actions: {
    getToken ({ commit }) {
      commit('loading/SET_LOADING', true, { root: true })
      
      oauth.getToken()
        .then(({ data }) => {
          // Guardar el token en el estado
          commit('SET_ACCESS_TOKEN', data.access_token)
        })
        .catch((err) => {
          // Limpiar token en caso de error
          commit('SET_ACCESS_TOKEN', null)
          console.log('Error OAuth: ', err)
        })
        .finally(() => {
          commit('loading/SET_LOADING', false, { root: true })
        })
    }
  }
}
```

### 4. Inicialización Automática (src/main.js)

El token se obtiene automáticamente cuando la aplicación se inicia:

```javascript
new Vue({
  router,
  store,
  methods: {
    init () {
      // Obtener token al iniciar la aplicación
      store.dispatch('oauth/getToken')
    }
  },
  created () {
    this.init()
  },
  render: h => h(App)
})
```

### 5. Uso del Token en las APIs (src/api/search.js)

El token almacenado se utiliza en todas las peticiones a la API de Diablo 3:

```javascript
function getApiAccount ({ region, account }) {
  const resource = `d3/profile/${account}/`
  const API_URL = `${protocol}${region}${host}${resource}`
  const locale = locales[region]

  const params = {
    // Token recuperado desde Vuex
    access_token: store.state.oauth.accessToken,
    locale
  }

  return get(API_URL, { params })
}
```

## Arquitectura del Sistema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue App       │────▶│   Vuex Store    │────▶│  Blizzard API   │
│   (main.js)     │     │   (oauth.js)    │     │  (battle.net)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │
         │                        │                        │
    1. init()                2. getToken()           3. OAuth Request
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                             4. Store Token
                                  │
┌─────────────────┐              │              ┌─────────────────┐
│   API Calls     │◀─────────────┘              │   Components    │
│  (search.js)    │                             │   (Profile)     │
└─────────────────┘                             └─────────────────┘
```

## Configuración Paso a Paso

### 1. Registrar Aplicación en Blizzard

1. Accede a https://develop.battle.net/
2. Inicia sesión con tu cuenta de Battle.net
3. Ve a "My Applications" y crea una nueva aplicación
4. Obtén tu `Client ID` y `Client Secret`

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VUE_APP_TITLE=DIABLO_3
VUE_APP_CLIENT_ID=tu_client_id_de_blizzard
VUE_APP_CLIENT_SECRET=tu_client_secret_de_blizzard
```

### 3. Verificar Funcionamiento

La aplicación obtendrá automáticamente el token al iniciar. Puedes verificar que funciona:

1. Abre las herramientas de desarrollador del navegador
2. Ve a la pestaña "Network"
3. Recarga la aplicación
4. Busca una petición a `battle.net/oauth/token`
5. Verifica que la respuesta contiene un `access_token`

## Gestión de Errores

El sistema incluye manejo de errores:

```javascript
.catch((err) => {
  // Limpia el token inválido
  commit('SET_ACCESS_TOKEN', null)
  console.log('Error OAuth: ', err)
})
```

Los errores comunes incluyen:

- **401 Unauthorized**: Credenciales incorrectas
- **429 Too Many Requests**: Límite de rate limiting excedido
- **500 Server Error**: Error en el servidor de Blizzard

## Estados de Carga

La aplicación gestiona estados de carga durante la autenticación:

- `loading/SET_LOADING` se activa durante la petición OAuth
- Los componentes pueden mostrar indicadores de carga basados en este estado
- La interfaz se renderiza solo después de completar la autenticación

## Limitaciones y Consideraciones

1. **Rate Limiting**: Blizzard tiene límites en las peticiones por segundo y por hora
2. **Expiración de Token**: Los tokens expiran y deben renovarse
3. **Región**: Actualmente configurado para la región 'eu' (Europa)
4. **Seguridad**: Las credenciales deben mantenerse privadas

## Modificar la Región

Para cambiar de región, modifica el archivo `src/api/oauth.js`:

```javascript
// Cambiar de 'eu' a 'us', 'kr', o 'tw'
const region = 'us'  // Estados Unidos
// const region = 'kr'  // Corea
// const region = 'tw'  // Taiwán
```

## Solución de Problemas

### Token no se obtiene
1. Verifica las credenciales en `.env`
2. Confirma que la aplicación está registrada en Blizzard
3. Revisa la consola del navegador para errores

### Error 401
- Las credenciales son incorrectas
- Verifica `VUE_APP_CLIENT_ID` y `VUE_APP_CLIENT_SECRET`

### Error 429
- Has excedido el límite de peticiones
- Espera antes de hacer más peticiones
- Considera implementar rate limiting en la aplicación

Este sistema proporciona una autenticación robusta y automática para acceder a la API de Diablo 3 de Blizzard.