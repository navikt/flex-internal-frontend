import React, { useState, useEffect, useCallback, useRef } from 'react'
import { InlineMessage, Search } from '@navikt/ds-react'
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
    const [funnetFnr, settFunnetFnr] = useState<string | undefined>()
    // Ref for å unngå at sync-effekten overskriver søkefeltet ved aktørId-oppslag
    const fnrFraAktorIdRef = useRef<string | undefined>()

    const onAktorIdFunnet = useCallback(
        (losnetFnr: string) => {
            fnrFraAktorIdRef.current = losnetFnr
            settFunnetFnr(losnetFnr)
            settFnr(losnetFnr)
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

    // Synkroniser søkefeltet med valgt fnr fra context – men ikke når fnr kom fra aktørId-oppslag
    // (da skal søkefeltet vise aktørId-en som ble søkt på, ikke det løste fnr)
    useEffect(() => {
        if (fnrFraAktorIdRef.current === fnr) return
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
            settFunnetFnr(undefined)
            fnrFraAktorIdRef.current = undefined
            settAktorId(validertVerdi)
            return
        }

        const erSammeFnr = validertVerdi === fnr
        settFnr(validertVerdi)

        if (erSammeFnr) {
            void queryClient.invalidateQueries({ refetchType: 'active' })
        }
    }

    const dynamiskDescription =
        valideringstype === 'fnrEllerAktorId' && resultat.status === 'laster' ? 'Slår opp aktørId...' : description

    return (
        <div className={className}>
            <Search
                hideLabel={false}
                htmlSize={htmlSize}
                label={label}
                description={dynamiskDescription}
                value={sokeverdi}
                error={feilmelding ?? (resultat.status === 'feil' ? resultat.melding : undefined)}
                onChange={(verdi) => {
                    setSokeverdi(verdi)
                    settFunnetFnr(undefined)
                    fnrFraAktorIdRef.current = undefined
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
            {funnetFnr && (
                <InlineMessage status="success" size="small" className="mt-1">
                    Fant fnr: {funnetFnr}
                </InlineMessage>
            )}
        </div>
    )
}

export default FnrSokefelt
