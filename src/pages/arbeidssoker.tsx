import React, { useState } from 'react'
import { TextField } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker } from '../queryhooks/useArbeidssoker'

const ArbeidssokerPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useArbeidssoker(fnr, !!fnr && fnr.length == 11)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Fnr"
                onChange={(e) => (e.target.value.length == 11 ? setFnr(e.target.value) : setFnr(undefined))}
            />
            <div>{data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}</div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default ArbeidssokerPage
