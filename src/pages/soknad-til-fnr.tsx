import React, { useState } from 'react'
import { BodyShort, TextField } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSoknad } from '../queryhooks/useSoknad'

const SoknadTilFnrPage = () => {
    const [soknadId, setSoknadId] = useState<string>()

    const { data: data } = useSoknad(soknadId, soknadId !== undefined)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Sykepengesoknad id"
                onChange={(e) => (e.target.value.length == 36 ? setSoknadId(e.target.value) : setSoknadId(undefined))}
            />
            {data?.sykepengesoknad && <BodyShort>{'Fødselsnummer: ' + data.fnr}</BodyShort>}
            {data?.sykepengesoknad && <pre>{JSON.stringify(data.sykepengesoknad, null, 2)}</pre>}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SoknadTilFnrPage
