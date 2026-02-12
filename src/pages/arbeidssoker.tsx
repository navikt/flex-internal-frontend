import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker } from '../queryhooks/useArbeidssoker'
import { handterFnrValidering } from '../utils/inputValidering'

const ArbeidssokerPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useArbeidssoker(fnr, !!fnr && fnr.length == 11)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Fødselsnummer"
                onSearchClick={(input) => {
                    handterFnrValidering(input, setFnr)
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterFnrValidering(evt.currentTarget.value, setFnr)
                    }
                }}
            />
            <div>{data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}</div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default ArbeidssokerPage
