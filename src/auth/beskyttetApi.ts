import { logger } from '@navikt/next-logger'
import { NextApiRequest, NextApiResponse } from 'next'
import { getToken, validateAzureToken } from '@navikt/oasis'

import { isMockBackend } from '../utils/environment'

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>

export function beskyttetApi(handler: ApiHandler): ApiHandler {
    return async function withBearerTokenHandler(req, res) {
        if (isMockBackend()) {
            return handler(req, res)
        }

        async function beskyttetApiInterne(req: NextApiRequest, res: NextApiResponse): Promise<void> {
            const bearerToken = getToken(req)
            if (!bearerToken) {
                return send401()
            }
            const result = await validateAzureToken(bearerToken)
            if (!result.ok) {
                logger.warn('kunne ikke validere azuretoken i beskyttetApi')
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
