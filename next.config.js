/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        sykepengesoknadBackendClientId: process.env.SYKEPENGESOKNAD_BACKEND_CLIENT_ID,
        flexInntektsmeldingStatusClientId: process.env.FLEX_INNTEKTSMELDING_STATUS_CLIENT_ID,
        flexArbeidssokerregisterClientId: process.env.FLEX_ARBEIDSSOKERREGISTER_OPPDATERING_CLIENT_ID,
        flexSyketilfelleClientId: process.env.FLEX_SYKETILFELLE_CLIENT_ID,
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        mockBackend: process.env.MOCK_BACKEND,
        spleisSporingUrl: process.env.SPLEIS_SPORING_URL,
        spannerUrl: process.env.SPANNER_URL,
        naisClusterName: process.env.NAIS_CLUSTER_NAME,
    },
}
