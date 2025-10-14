import React, { useState } from 'react'
import { Button, Label, TextField } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useVentetid } from '../queryhooks/useVentetid'

const VentetidPage = () => {
    const [fnr, setFnr] = useState<string>()
    const [sykmeldingId, setSykmeldingId] = useState<string>()
    const [doFetch, setDoFetch] = useState(false)

    const { data } = useVentetid(fnr, sykmeldingId, doFetch && !!fnr && !!sykmeldingId)

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Fnr"
                onChange={(e) => {
                    const value = e.target.value
                    setDoFetch(false)
                    value.length === 11 ? setFnr(value) : setFnr(undefined)
                }}
            />
            <TextField
                label="SykmeldingId"
                onChange={(e) => {
                    const value = e.target.value
                    setDoFetch(false)
                    value.length > 0 ? setSykmeldingId(value) : setSykmeldingId(undefined)
                }}
            />
            <Button onClick={() => setDoFetch(true)} disabled={!fnr || !sykmeldingId} variant="primary" size="small">
                Hent ventetid
            </Button>
            <div>
                <Label>Ventetid</Label>
                {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
            </div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default VentetidPage
