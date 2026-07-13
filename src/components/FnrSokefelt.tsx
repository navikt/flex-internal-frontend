import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { BodyShort, Chips, InlineMessage, Search } from '@navikt/ds-react'
import { useQueryClient } from '@tanstack/react-query'

import { validerFnr, validerIdent } from '../utils/inputValidering'
import { useValgtFnr } from '../utils/useValgtFnr'
import { useAktorIdOppslag } from '../utils/useAktorIdOppslag'
import { useIdenter } from '../queryhooks/useIdenter'

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
    const [soktMedType, setSoktMedType] = useState<'fnr' | 'aktorId' | undefined>()
    // Ref for å unngå at sync-effekten overskriver søkefeltet ved aktørId-oppslag
    const fnrFraAktorIdRef = useRef<string | undefined>(undefined)

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

    // Hent aktørId når bruker søkte med fnr
    const {
        data: identerForFnr,
        isLoading: henterIdenterForFnr,
        isError: feiletAktorIdOppslag,
    } = useIdenter(fnr, valideringstype === 'fnrEllerAktorId' && soktMedType === 'fnr' && fnr !== undefined)
    const funnetAktorId = useMemo(() => {
        if (!identerForFnr) return undefined
        return identerForFnr.find((i) => i.gruppe === 'AKTORID' && !i.historisk)?.ident
    }, [identerForFnr])

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
            setSoktMedType('aktorId')
            settAktorId(validertVerdi)
            return
        }

        // Avbryt evt. pågående aktørId-oppslag før vi setter fnr direkte
        settAktorId(undefined)
        if (valideringstype === 'fnrEllerAktorId') {
            setSoktMedType('fnr')
        }

        const erSammeFnr = validertVerdi === fnr
        settFnr(validertVerdi)

        if (erSammeFnr) {
            void queryClient.invalidateQueries({ refetchType: 'active' })
        }
    }

    const velgFnr = (valgtFnr: string) => {
        fnrFraAktorIdRef.current = valgtFnr
        settFunnetFnr(valgtFnr)
        settFnr(valgtFnr)
        settAktorId(undefined)
        // soktMedType er alltid 'aktorId' her – trenger ikke settes på nytt
        setFeilmelding(undefined)
    }

    let dynamiskDescription = description
    if (valideringstype === 'fnrEllerAktorId') {
        if (resultat.status === 'laster') {
            dynamiskDescription = 'Slår opp fnr fra aktørId...'
        } else if (soktMedType === 'fnr' && henterIdenterForFnr) {
            dynamiskDescription = 'Slår opp aktørId...'
        }
    }

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
                    setSoktMedType(undefined)
                    fnrFraAktorIdRef.current = undefined
                    // Avbryt evt. pågående aktørId-oppslag (unngår race condition)
                    settAktorId(undefined)
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
                <Search.Button
                    loading={resultat.status === 'laster' || (soktMedType === 'fnr' && henterIdenterForFnr)}
                />
            </Search>
            {soktMedType === 'aktorId' && funnetFnr && (
                <InlineMessage status="success" size="small" className="mt-1" role="status">
                    Søkte på aktørId – fant fnr: {funnetFnr}
                </InlineMessage>
            )}
            {soktMedType === 'fnr' && funnetAktorId && (
                <InlineMessage status="success" size="small" className="mt-1" role="status">
                    Søkte på fnr – fant aktørId: {funnetAktorId}
                </InlineMessage>
            )}
            {soktMedType === 'fnr' && feiletAktorIdOppslag && (
                <InlineMessage status="error" size="small" className="mt-1" role="alert">
                    Kunne ikke slå opp aktørId for dette fødselsnummeret
                </InlineMessage>
            )}
            {resultat.status === 'flereFunnet' && (
                <div className="mt-2" role="alert">
                    <BodyShort size="small" weight="semibold" className="mb-1">
                        Flere fødselsnummer funnet – velg:
                    </BodyShort>
                    <Chips size="small">
                        {resultat.fnrListe.map((f) => (
                            <Chips.Toggle key={f} checkmark={false} onClick={() => velgFnr(f)}>
                                {f}
                            </Chips.Toggle>
                        ))}
                    </Chips>
                </div>
            )}
        </div>
    )
}

export default FnrSokefelt
