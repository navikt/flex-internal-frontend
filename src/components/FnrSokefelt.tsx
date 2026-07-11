import React, { useState, useEffect, useCallback } from 'react'
import { Search } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { validerFnr, validerIdent } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'
import { useAktorIdOppslag } from '../utils/useAktorIdOppslag'

type Valideringstype = 'fnr' | 'ident' | 'fnrEllerAktorId'

type Props = {
    className?: string
    htmlSize?: string
    label?: string
    description?: string
    valideringstype?: Valideringstype
}

const feilmeldinger: Record<Valideringstype, string> = {
    fnr: 'Fødselsnummer må være 11 siffer',
    ident: 'Ident må være 11 eller 13 siffer',
    fnrEllerAktorId: 'Skriv inn 11-sifret fnr eller 13-sifret aktørId',
}

const valideringsfunksjoner: Record<Valideringstype, (input: string) => string | null> = {
    fnr: validerFnr,
    ident: validerIdent,
    fnrEllerAktorId: validerIdent,
}

const FnrSokefelt = ({
    className,
    htmlSize = '20',
    label = 'Fødselsnummer',
    description,
    valideringstype = 'fnr',
}: Props) => {
    const { fnr, settFnr, nullstillFnr } = useValgtFnr()
    const queryClient = useQueryClient()
    const [sokeverdi, setSokeverdi] = useState(fnr ?? '')
    const [feilmelding, setFeilmelding] = useState<string>()

    const onAktorIdFunnet = useCallback(
        (funnetFnr: string) => {
            settFnr(funnetFnr)
            setFeilmelding(undefined)
        },
        [settFnr],
    )

    const { settAktorId, resultat } = useAktorIdOppslag(onAktorIdFunnet)

    // Nullstill fnr ved feilet aktørId-oppslag (nullstillFnr er en kontekst-setter, ikke lokal state)
    useEffect(() => {
        if (resultat.status !== 'feil') return
        nullstillFnr()
    }, [resultat, nullstillFnr])

    // Synkroniser søkefeltet med valgt fnr fra context slik at feltet fylles
    // når et id-oppslag treffer
    useEffect(() => {
        const timer = setTimeout(() => setSokeverdi(fnr ?? ''), 0)
        return () => clearTimeout(timer)
    }, [fnr])

    const handterSok = (input: string) => {
        setSokeverdi(input)

        const validertVerdi = valideringsfunksjoner[valideringstype](input)
        if (!validertVerdi) {
            setFeilmelding(feilmeldinger[valideringstype])
            nullstillFnr()
            return
        }

        setFeilmelding(undefined)

        if (valideringstype === 'fnrEllerAktorId' && validertVerdi.length === 13) {
            settAktorId(validertVerdi)
            return
        }

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
            hideLabel={false}
            htmlSize={htmlSize}
            label={label}
            description={description}
            value={sokeverdi}
            error={feilmelding ?? (resultat.status === 'feil' ? resultat.melding : undefined)}
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
        >
            <Search.Button loading={resultat.status === 'laster'} />
        </Search>
    )
}

export default FnrSokefelt
