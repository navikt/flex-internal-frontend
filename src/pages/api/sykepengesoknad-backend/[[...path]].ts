import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const { serverRuntimeConfig } = getConfig()

const tillatteApier = [
    'POST /api/v1/flex/sykepengesoknader',
    'POST /api/v1/flex/fta-vedtak',
    'POST /api/v1/flex/identer',
    'POST /api/v1/flex/aareg',
    'POST /api/v1/flex/sigrun',
    'GET /api/v1/flex/sykepengesoknader/[uuid]',
]

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'sykepengesoknad-backend',
        hostname: 'sykepengesoknad-backend',
        backendClientId: serverRuntimeConfig.sykepengesoknadBackendClientId,
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
