import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const SYKEPENGESOKNAD_BACKEND_CLIENT_ID = process.env.SYKEPENGESOKNAD_BACKEND_CLIENT_ID || ''

const tillatteApier = [
    'POST /api/v1/flex/sykepengesoknader',
    'POST /api/v1/flex/fta-vedtak',
    'POST /api/v1/flex/identer',
    'POST /api/v1/flex/aareg',
    'POST /api/v1/flex/sigrun',
    'POST /api/v1/flex/arbeidssokerregister',
    'POST /api/v1/flex/fta-vedtak-for-person',
    'GET /api/v1/flex/sykepengesoknader/[uuid]',
    'GET /api/v1/flex/fta-vedtak/ubehandlede',
    'POST /api/v1/flex/fta-vedtak-for-person/opprett',
    'POST /api/v1/flex/fta-vedtak/endre-status',
    'POST /api/v1/flex/fta-vedtak/endre-tom',
    'POST /api/v1/flex/fta-vedtak/ignorer-arbs',
    'DELETE /api/v1/flex/fta-soknad',
    'GET /api/v3/soknader/[uuid]/kafkaformat',
]

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'sykepengesoknad-backend',
        hostname: 'sykepengesoknad-backend',
        backendClientId: SYKEPENGESOKNAD_BACKEND_CLIENT_ID,
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
