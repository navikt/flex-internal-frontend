/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        azureAppClientId: process.env.AZURE_APP_CLIENT_ID,
        azureAppClientSecret: process.env.AZURE_APP_CLIENT_SECRET,
        azureOpenidConfigTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT,
        azureAppWellKnownUrl: process.env.AZURE_APP_WELL_KNOWN_URL,
        sykepengesoknadBackendClientId: process.env.SYKEPENGESOKNAD_BACKEND_CLIENT_ID,
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        mockBackend: process.env.MOCK_BACKEND,
    },
}
