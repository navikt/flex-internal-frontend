import { NextApiRequest, NextApiResponse } from 'next'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { AmplitudeResponse } from '../../../queryhooks/useAmplitudedata'

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    if (process.env.LOCAL_BACKEND === 'true') {
        const amplitudeResponse = await fetch('http://localhost/api/amplitude')
        const amplitudeData: AmplitudeResponse = await amplitudeResponse.json()

        return res.json(amplitudeData)
    }

    const { amplitudeId } = req.query
    const amplitudeResponse = await fetch(
        'https://reops-proxy.intern.nav.no/amplitude/api/2/useractivity?user=' + amplitudeId,
    )
    const amplitudeData = await amplitudeResponse.json()
    res.json(amplitudeData)
})

export default handler
