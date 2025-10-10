import React, { useState } from 'react'
import { TextField } from '@navikt/ds-react'
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSoknadKafkaformat } from '../queryhooks/useSoknadKafkaformat'

const SoknadKafkaformatPage = () => {
    const [soknadId, setSoknadId] = useState<string>()

    const { data } = useSoknadKafkaformat(soknadId, soknadId !== undefined)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Sykepengesøknad ID"
                onChange={(e) => (e.target.value.length == 36 ? setSoknadId(e.target.value) : setSoknadId(undefined))}
            />
            {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SoknadKafkaformatPage
