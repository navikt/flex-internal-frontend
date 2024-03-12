import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { getToken, validateAzureToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { isMockBackend } from '../utils/environment'

type PageHandler<InitialPageProps> = (
    context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<InitialPageProps>>

export function beskyttetSide<InitialPageProps>(handler: PageHandler<InitialPageProps>) {
    return async function withBearerTokenHandler(
        context: GetServerSidePropsContext,
    ): Promise<ReturnType<NonNullable<typeof handler>>> {
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
        const token = getToken(context.req)
        if (token == null) {
            return wonderwallRedirect
        }

        const validationResult = await validateAzureToken(token)

        if (!validationResult.ok) {
            const error = new Error(
                `Invalid JWT token found (cause: ${validationResult.error.message}, redirecting to login.`,
                { cause: validationResult.error },
            )

            if (validationResult.errorType === 'token expired') {
                logger.warn(error)
            } else {
                logger.error(error)
            }
            return wonderwallRedirect
        }
        return handler(context)
    }
}
