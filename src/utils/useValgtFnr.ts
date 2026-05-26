import { createContext, createElement, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export type OppslagData = {
    sykmelding?: object
    soknad?: object
}

type ValgtFnrContextType = {
    fnr: string | undefined
    settFnr: (nyttFnr: string) => void
    nullstillFnr: () => void
    valgtPeriodeId?: string | null
    valgtDrawerKildeId?: string | null
    oppslagData?: OppslagData
    settValgtPeriode?: (periodeId: string | null, kildeId?: string | null, data?: OppslagData) => void
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
    oppslagData: {},
    settValgtPeriode: () => undefined,
    nullstillValgtPeriode: () => undefined,
})

export const ValgtFnrProvider = ({ children }: { children: ReactNode }) => {
    const [fnr, settFnr] = useState<string | undefined>()
    const [valgtPeriodeId, setValgtPeriodeId] = useState<string | null>(null)
    const [valgtDrawerKildeId, setValgtDrawerKildeId] = useState<string | null>(null)
    const [oppslagData, setOppslagData] = useState<OppslagData>({})

    const settValgtPeriode = useCallback((periodeId: string | null, kildeId?: string | null, data?: OppslagData) => {
        setValgtPeriodeId(periodeId ?? null)
        setValgtDrawerKildeId(kildeId ?? null)
        if (data) setOppslagData(data)
    }, [])

    const nullstillValgtPeriode = useCallback(() => {
        setValgtPeriodeId(null)
        setValgtDrawerKildeId(null)
        setOppslagData({})
    }, [])

    const verdi = useMemo(
        () => ({
            fnr,
            settFnr,
            nullstillFnr: () => settFnr(undefined),
            valgtPeriodeId,
            valgtDrawerKildeId,
            oppslagData,
            settValgtPeriode,
            nullstillValgtPeriode,
        }),
        [fnr, valgtPeriodeId, valgtDrawerKildeId, oppslagData, settValgtPeriode, nullstillValgtPeriode],
    )

    return createElement(ValgtFnrContext.Provider, { value: verdi }, children)
}

export const useValgtFnr = () => useContext(ValgtFnrContext)

export default useValgtFnr
