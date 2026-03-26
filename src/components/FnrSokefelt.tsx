import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { handterFnrValidering } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'

type Props = {
    className?: string
    htmlSize?: string
    label?: string
}

const FnrSokefelt = ({ className, htmlSize = '20', label = 'Fødselsnummer' }: Props) => {
    const { fnr, settFnr } = useValgtFnr()
    const queryClient = useQueryClient()
    const [sokeverdi, setSokeverdi] = useState(fnr ?? '')

    const handterSok = (input: string) => {
        setSokeverdi(input)
        handterFnrValidering(input, (nyttFnr) => {
            const erSammeFnr = nyttFnr === fnr
            settFnr(nyttFnr)

            if (erSammeFnr) {
                void queryClient.invalidateQueries({ refetchType: 'active' })
            }
        })
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
