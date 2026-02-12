import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSoknadKafkaformat } from '../queryhooks/useSoknadKafkaformat'
import { handterUuidValidering } from '../utils/inputValidering'

const SoknadKafkaformatPage = () => {
    const [soknadId, setSoknadId] = useState<string>()

    const { data } = useSoknadKafkaformat(soknadId, soknadId !== undefined)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="40"
                label="Sykepengesøknad ID"
                onSearchClick={(input) => {
                    handterUuidValidering(
                        input,
                        setSoknadId,
                        undefined,
                        'Sykepengesøknad ID må være en UUID på 36 tegn',
                    )
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterUuidValidering(
                            evt.currentTarget.value,
                            setSoknadId,
                            undefined,
                            'Sykepengesøknad ID må være en UUID på 36 tegn',
                        )
                    }
                }}
            />
            {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SoknadKafkaformatPage
