import { NextPageContext } from 'next'

import { isMockBackend } from '../utils/environment'

import { verifyAzureAccessToken } from './azureVerifisering'

type PageHandler = (context: NextPageContext) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function beskyttetSide(handler: PageHandler): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async function withBearerTokenHandler(context: NextPageContext): Promise<any> {
        if (isMockBackend()) {
            return handler(context)
        }

        const request = context.req
        if (request == null) {
            throw new Error('Context is missing request. This should not happen')
        }

        const wonderwallRedirect = {
            redirect: {
                destination: '/oauth2/login?redirect=/',
                permanent: false,
            },
        }
        const bearerToken: string | null | undefined = request.headers['authorization']
        if (!bearerToken) {
            return wonderwallRedirect
        }
        try {
            await verifyAzureAccessToken(bearerToken)
        } catch (e) {
            return wonderwallRedirect
        }
        return handler(context)
    }
}
