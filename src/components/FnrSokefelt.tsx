import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { validerFnr, validerIdent } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'

type Valideringstype = 'fnr' | 'ident'

type Props = {
    className?: string
    htmlSize?: string
    label?: string
    valideringstype?: Valideringstype
}

const feilmeldinger: Record<Valideringstype, string> = {
    fnr: 'Fødselsnummer må være 11 siffer',
    ident: 'Ident må være 11 eller 13 siffer',
}

const valideringsfunksjoner: Record<Valideringstype, (input: string) => string | null> = {
    fnr: validerFnr,
    ident: validerIdent,
}

const FnrSokefelt = ({ className, htmlSize = '20', label = 'Fødselsnummer', valideringstype = 'fnr' }: Props) => {
    const { fnr, settFnr, nullstillFnr } = useValgtFnr()
    const queryClient = useQueryClient()
    const [sokeverdi, setSokeverdi] = useState(fnr ?? '')
    const [feilmelding, setFeilmelding] = useState<string>()

    const handterSok = (input: string) => {
        setSokeverdi(input)

        const validertVerdi = valideringsfunksjoner[valideringstype](input)
        if (!validertVerdi) {
            setFeilmelding(feilmeldinger[valideringstype])
            nullstillFnr()
            return
        }

        setFeilmelding(undefined)

        const erSammeFnr = validertVerdi === fnr
        settFnr(validertVerdi)

        if (erSammeFnr) {
            void queryClient.invalidateQueries({ refetchType: 'active' })
        }
    }

    return (
        <Search
            key={fnr ?? 'tomt-fnr'}
            className={className}
            htmlSize={htmlSize}
            label={label}
            value={sokeverdi}
            error={feilmelding}
            onChange={(verdi) => {
                setSokeverdi(verdi)
                if (feilmelding) {
                    setFeilmelding(undefined)
                }
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
