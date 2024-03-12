import { proxyApiRouteRequest } from '@navikt/next-api-proxy'
import { logger } from '@navikt/next-logger'
import { NextApiRequest, NextApiResponse } from 'next'
import { requestAzureOboToken } from '@navikt/oasis'

export interface BackendProxyOpts {
    req: NextApiRequest
    res: NextApiResponse
    tillatteApier: string[]
    backend: string
    hostname: string
    backendClientId: string
}

export function validerKall(opts: BackendProxyOpts): { api: string; rewritedPath: string } | undefined {
    const rewritedPath = opts.req.url?.replace(`/api/${opts.backend}`, '')
    if (!rewritedPath) {
        throw new Error('rewritedPath is undefined')
    }

    const api = `${opts.req.method} ${cleanPathForMetric(rewritedPath)}`
    if (!opts.tillatteApier.includes(api)) {
        logger.warn(`404: ukjent api: ${api}.`)
        opts.res.status(404)
        opts.res.send(null)
        opts.res.end()
        return undefined
    }

    return { rewritedPath, api }
}

export async function proxyKallTilBackend(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return

    async function bearerToken(): Promise<string | undefined> {
        if (!opts.req.headers.authorization) throw new Error('Mangler authorization header')

        if (opts.backendClientId) {
            const obo = await requestAzureOboToken(opts.req?.headers.authorization?.split(' ')[1], opts.backendClientId)
            if (!obo.ok) {
                throw new Error(
                    `Unable to exchange token for ${opts.backendClientId} token,reason: ${obo.error.message}`,
                    {
                        cause: obo.error,
                    },
                )
            }
            return obo.token
        }
        return undefined
    }

    await proxyApiRouteRequest({ ...opts, path: validert.rewritedPath, bearerToken: await bearerToken(), https: false })
}

const UUID = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/g
const ORGNR = /\b[0-9a-f]{9}\b/g

function cleanPathForMetric(value: string): string {
    return value?.replace(UUID, '[uuid]').replace(ORGNR, '[orgnr]')
}
