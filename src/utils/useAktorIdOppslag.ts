import { useState, useEffect, useCallback, useMemo } from 'react'

import { useIdenter } from '../queryhooks/useIdenter'

type AktorIdOppslagResultat =
    | { status: 'inaktiv' }
    | { status: 'laster' }
    | { status: 'feil'; melding: string }
    | { status: 'funnet'; fnr: string }
    | { status: 'flereFunnet'; fnrListe: string[] }

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

        const folkeregisterIdenter = identer.filter((i) => i.gruppe === 'FOLKEREGISTERIDENT')
        if (folkeregisterIdenter.length === 0) {
            return { status: 'feil', melding: 'Fant ikke fødselsnummer for oppgitt aktørId' }
        }

        // Foretrekk aktive (ikke-historiske) identer
        const aktive = folkeregisterIdenter.filter((i) => !i.historisk)
        const kandidater = aktive.length > 0 ? aktive : folkeregisterIdenter

        if (kandidater.length === 1) {
            return { status: 'funnet', fnr: kandidater[0].ident }
        }
        return { status: 'flereFunnet', fnrListe: kandidater.map((i) => i.ident) }
    }, [aktorId, isLoading, isError, identer])

    useEffect(() => {
        if (resultat.status === 'funnet') {
            onFunnet(resultat.fnr)
        }
        // Reset aktorId etter funnet eller feil, men ikke ved flereFunnet (bruker må velge)
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
