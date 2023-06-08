import { logger } from '@navikt/next-logger'
import { NextApiRequest, NextApiResponse } from 'next'

import { isMockBackend } from '../utils/environment'

import { verifyAzureAccessToken } from './azureVerifisering'

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>

export function beskyttetApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res) {
        if (isMockBackend()) {
            return handler(req, res)
        }

        async function beskyttetApiInterne(req: NextApiRequest, res: NextApiResponse): Promise<void> {
            const bearerToken: string | null | undefined = req.headers['authorization']
            if (!bearerToken) {
                return send401()
            }
            try {
                await verifyAzureAccessToken(bearerToken)
            } catch (e) {
                logger.error(e, 'Kunne ikke autentisere.')
                return send401()
            }
            return handler(req, res)
        }

        return beskyttetApiInterne(req, res)

        function send401(): void {
            res.status(401).json({ message: 'Access denied' })
        }
    }
}
