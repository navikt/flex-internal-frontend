import { useState, useEffect, useCallback, useMemo } from 'react'

import { useIdenter } from '../queryhooks/useIdenter'

type AktorIdOppslagResultat =
    | { status: 'inaktiv' }
    | { status: 'laster' }
    | { status: 'feil'; melding: string }
    | { status: 'funnet'; fnr: string }

export function useAktorIdOppslag(onFunnet: (fnr: string) => void): {
    settAktorId: (aktorId: string | undefined) => void
    resultat: AktorIdOppslagResultat
} {
    const [aktorId, settAktorIdState] = useState<string | undefined>()

    const { data: identer, isLoading, isError } = useIdenter(aktorId, aktorId !== undefined)

    const resultat = useMemo((): AktorIdOppslagResultat => {
        if (aktorId === undefined) return { status: 'inaktiv' }
        if (isLoading) return { status: 'laster' }
        if (isError) return { status: 'feil', melding: 'Feil ved oppslag av aktørId' }
        if (!identer) return { status: 'laster' }
        const folkeregisterIdent = identer.find((i) => i.gruppe === 'FOLKEREGISTERIDENT')
        if (folkeregisterIdent) return { status: 'funnet', fnr: folkeregisterIdent.ident }
        return { status: 'feil', melding: 'Fant ikke fødselsnummer for oppgitt aktørId' }
    }, [aktorId, isLoading, isError, identer])

    useEffect(() => {
        if (resultat.status === 'funnet') {
            onFunnet(resultat.fnr)
        }
        if (resultat.status === 'funnet' || resultat.status === 'feil') {
            const timer = setTimeout(() => settAktorIdState(undefined), 0)
            return () => clearTimeout(timer)
        }
    }, [resultat, onFunnet])

    const settAktorId = useCallback((nyAktorId: string | undefined) => {
        settAktorIdState(nyAktorId)
    }, [])

    return { settAktorId, resultat }
}
