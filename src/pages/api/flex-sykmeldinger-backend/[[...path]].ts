import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const FLEX_SYKMELDINGER_BACKEND_CLIENT_ID = process.env.FLEX_SYKMELDINGER_BACKEND_CLIENT_ID || ''

const tillatteApier = ['POST /api/v1/flex/sykmeldinger', 'GET /api/v1/sykmeldinger/[uuid]']

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'flex-sykmeldinger-backend',
        hostname: 'flex-sykmeldinger-backend',
        backendClientId: FLEX_SYKMELDINGER_BACKEND_CLIENT_ID,
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
