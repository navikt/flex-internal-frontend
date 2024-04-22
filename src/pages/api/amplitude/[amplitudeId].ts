import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const { amplitudeId } = req.query
    const amplitudeResponse = await fetch(
        'https://reops-proxy.intern.nav.no/amplitude/api/2/useractivity?user=' + amplitudeId,
    )
    const amplitudeData = await amplitudeResponse.json()
    res.json(amplitudeData)
})

export default handler
