import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from 'jose'
import { GetKeyFunction, JWTVerifyResult, ResolvedKey } from 'jose/dist/types/types'
import getConfig from 'next/config'
import { Client, Issuer } from 'openid-client'

import { ErrorMedStatus } from './ErrorMedStatus'

const { serverRuntimeConfig } = getConfig()

export async function verifyAzureAccessToken(bearerToken: string): Promise<void> {
    const token = bearerToken.split(' ')[1]
    const verified = await validerToken(token)

    if (verified.payload.aud !== serverRuntimeConfig.azureAppClientId) {
        throw new ErrorMedStatus('Audience matcher ikke min client ID', 401)
    }
}

let _issuer: Issuer<Client>
let _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>

async function validerToken(token: string | Uint8Array): Promise<JWTVerifyResult & ResolvedKey> {
    return jwtVerify(token, await jwks(), {
        issuer: (await issuer()).metadata.issuer,
    })
}

async function jwks(): Promise<GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>> {
    if (typeof _remoteJWKSet === 'undefined') {
        const iss = await issuer()
        _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri))
    }

    return _remoteJWKSet
}

async function issuer(): Promise<Issuer<Client>> {
    if (typeof _issuer === 'undefined') {
        if (!serverRuntimeConfig.azureAppWellKnownUrl)
            throw new Error('Miljøvariabelen AZURE_APP_WELL_KNOWN_URL må være satt')
        _issuer = await Issuer.discover(serverRuntimeConfig.azureAppWellKnownUrl)
    }
    return _issuer
}
