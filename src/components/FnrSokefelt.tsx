import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'

import { handterFnrValidering } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'

type Props = {
    className?: string
    htmlSize?: string
    label?: string
}

const FnrSokefelt = ({ className, htmlSize = '20', label = 'Fødselsnummer' }: Props) => {
    const { fnr, settFnr } = useValgtFnr()
    const [sokeverdi, setSokeverdi] = useState(fnr ?? '')

    const handterSok = (input: string) => {
        setSokeverdi(input)
        handterFnrValidering(input, settFnr)
    }

    return (
        <Search
            key={fnr ?? 'tomt-fnr'}
            className={className}
            htmlSize={htmlSize}
            label={label}
            value={sokeverdi}
            onChange={(verdi) => {
                setSokeverdi(verdi)
            }}
            onSearchClick={handterSok}
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    handterSok(evt.currentTarget.value)
                }
            }}
        />
    )
}

export default FnrSokefelt
