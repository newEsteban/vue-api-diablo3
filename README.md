# diablo3

Aplicación Vue.js para consultar la API de Diablo 3 de Blizzard.

## Documentación

- **[Autenticación](./AUTENTICACION.md)** - Guía completa sobre cómo funciona la autenticación OAuth 2.0
- **[Flujo de Autenticación](./docs/authentication-flow.md)** - Diagrama visual del proceso de autenticación
- **[Configuración](./env.example)** - Ejemplo de variables de entorno

## Configuración Rápida

1. Registra tu aplicación en [Blizzard Developer Portal](https://develop.battle.net/)
2. Copia `.env.example` a `.env` y configura tus credenciales:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de Blizzard
   ```
3. Instala dependencias y ejecuta:
   ```bash
   npm install
   npm run serve
   ```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
