import React, { useState } from 'react'
import { BodyShort, Search } from '@navikt/ds-react'
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSoknad } from '../queryhooks/useSoknad'
import { handterUuidValidering } from '../utils/inputValidering'

const SoknadTilFnrPage = () => {
    const [soknadId, setSoknadId] = useState<string>()

    const { data: data } = useSoknad(soknadId, soknadId !== undefined)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Sykepengesoknad ID"
                onSearchClick={(input) => {
                    handterUuidValidering(
                        input,
                        setSoknadId,
                        undefined,
                        'Sykepengesoknad ID må være en UUID på 36 tegn',
                    )
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterUuidValidering(
                            evt.currentTarget.value,
                            setSoknadId,
                            undefined,
                            'Sykepengesoknad ID må være en UUID på 36 tegn',
                        )
                    }
                }}
            />
            {data?.sykepengesoknad && <BodyShort>{'Fødselsnummer: ' + data.fnr}</BodyShort>}
            {data?.sykepengesoknad && (
                <JsonView data={data.sykepengesoknad} shouldExpandNode={allExpanded} style={defaultStyles} />
            )}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SoknadTilFnrPage
