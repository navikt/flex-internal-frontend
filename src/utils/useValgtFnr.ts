import { createContext, createElement, ReactNode, useContext, useMemo, useState } from 'react'

type ValgtFnrContextType = {
    fnr: string | undefined
    settFnr: (nyttFnr: string) => void
    nullstillFnr: () => void
    valgtPeriodeId?: string | null
    valgtDrawerKildeId?: string | null
    settValgtPeriode?: (periodeId: string | null, kildeId?: string | null) => void
    nullstillValgtPeriode?: () => void
}

const manglerProvider = () => {
    throw new Error('useValgtFnr må brukes innenfor ValgtFnrProvider')
}

const ValgtFnrContext = createContext<ValgtFnrContextType>({
    fnr: undefined,
    settFnr: manglerProvider,
    nullstillFnr: manglerProvider,
    valgtPeriodeId: null,
    valgtDrawerKildeId: null,
    settValgtPeriode: () => undefined,
    nullstillValgtPeriode: () => undefined,
})

export const ValgtFnrProvider = ({ children }: { children: ReactNode }) => {
    const [fnr, settFnr] = useState<string | undefined>()
    const [valgtPeriodeId, setValgtPeriodeId] = useState<string | null>(null)
    const [valgtDrawerKildeId, setValgtDrawerKildeId] = useState<string | null>(null)

    const settValgtPeriode = (periodeId: string | null, kildeId?: string | null) => {
        setValgtPeriodeId(periodeId ?? null)
        setValgtDrawerKildeId(kildeId ?? null)
    }

    const nullstillValgtPeriode = () => {
        setValgtPeriodeId(null)
        setValgtDrawerKildeId(null)
    }

    const verdi = useMemo(
        () => ({
            fnr,
            settFnr,
            nullstillFnr: () => settFnr(undefined),
            valgtPeriodeId,
            valgtDrawerKildeId,
            settValgtPeriode,
            nullstillValgtPeriode,
        }),
        [fnr, valgtPeriodeId, valgtDrawerKildeId],
    )

    return createElement(ValgtFnrContext.Provider, { value: verdi }, children)
}

export const useValgtFnr = () => useContext(ValgtFnrContext)

export default useValgtFnr
