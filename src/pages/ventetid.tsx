import React, { useState } from 'react'
import { Label, TextField } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useVentetid } from '../queryhooks/useVentetid'

const VentetidPage = () => {
    const [fnr, setFnr] = useState<string>()
    const [sykmeldingId, setSykmeldingId] = useState<string>()

    const { data } = useVentetid(fnr, sykmeldingId, !!fnr && !!sykmeldingId)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="fnr"
                onChange={(e) => (e.target.value.length === 11 ? setFnr(e.target.value) : setFnr(undefined))}
            />
            <TextField
                label="SykmeldingId"
                onChange={(e) =>
                    e.target.value.length > 0 ? setSykmeldingId(e.target.value) : setSykmeldingId(undefined)
                }
            />
            <div>
                <Label>Ventetid</Label>
                {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
            </div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default VentetidPage
