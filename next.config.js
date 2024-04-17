/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        sykepengesoknadBackendClientId: process.env.SYKEPENGESOKNAD_BACKEND_CLIENT_ID,
        flexInntektsmeldingStatusClientId: process.env.FLEX_INNTEKTSMELDING_STATUS_CLIENT_ID,
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        mockBackend: process.env.MOCK_BACKEND,
    },
}
