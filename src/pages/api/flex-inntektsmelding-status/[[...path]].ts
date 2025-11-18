import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const FLEX_INNTEKTSMELDING_STATUS_CLIENT_ID = process.env.FLEX_INNTEKTSMELDING_STATUS_CLIENT_ID || ''

const tillatteApier = ['POST /api/v1/vedtak-og-inntektsmeldinger', 'POST /api/v1/cronjob']

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'flex-inntektsmelding-status',
        hostname: 'flex-inntektsmelding-status',
        backendClientId: FLEX_INNTEKTSMELDING_STATUS_CLIENT_ID,
    }
    if (isMockBackend()) {
        return mockApi(opts)
    }
    await proxyKallTilBackend(opts)
})

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
}

export default handler
