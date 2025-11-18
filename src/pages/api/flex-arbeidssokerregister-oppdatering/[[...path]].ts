import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const tillatteApier = [
    'POST /api/v1/flex/arbeidssokerperioder',
    'PUT /api/v1/flex/arbeidssokerperioder/oppdater-tom',
    'PUT /api/v1/flex/arbeidssokerperioder/oppdater-arbeidssokerperiode-id',
]

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'flex-arbeidssokerregister-oppdatering',
        hostname: 'flex-arbeidssokerregister-oppdatering',
        backendClientId: process.env.FLEX_ARBEIDSSOKERREGISTER_OPPDATERING_CLIENT_ID || '',
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
