import { TextField } from '@navikt/ds-react'
import React from 'react'

export default function FnrInput({ setFnr }: { setFnr: (fnr: any) => void }) {
    return (
        <TextField
            type="number"
            label="Fødselsnummer"
            onChange={(e) => (e.target.value.length == 11 ? setFnr(e.target.value) : setFnr(undefined))}
        />
    )
}
