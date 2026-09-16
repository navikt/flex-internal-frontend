import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'
import { isMockBackend } from '../../../utils/environment'

const SPINNSYN_BACKEND_CLIENT_ID = process.env.SPINNSYN_BACKEND_CLIENT_ID || ''

const tillatteApier = ['POST /api/v4/veileder/vedtak/soknad']

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'spinnsyn-backend',
        hostname: 'spinnsyn-backend',
        backendClientId: SPINNSYN_BACKEND_CLIENT_ID,
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
