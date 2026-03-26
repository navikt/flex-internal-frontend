import { createContext, createElement, ReactNode, useContext, useMemo, useState } from 'react'

type ValgtFnrContextType = {
    fnr: string | undefined
    settFnr: (nyttFnr: string) => void
    nullstillFnr: () => void
}

const manglerProvider = () => {
    throw new Error('useValgtFnr må brukes innenfor ValgtFnrProvider')
}

const ValgtFnrContext = createContext<ValgtFnrContextType>({
    fnr: undefined,
    settFnr: manglerProvider,
    nullstillFnr: manglerProvider,
})

export const ValgtFnrProvider = ({ children }: { children: ReactNode }) => {
    const [fnr, settFnr] = useState<string | undefined>()

    const verdi = useMemo(
        () => ({
            fnr,
            settFnr,
            nullstillFnr: () => settFnr(undefined),
        }),
        [fnr],
    )

    return createElement(ValgtFnrContext.Provider, { value: verdi }, children)
}

export const useValgtFnr = () => useContext(ValgtFnrContext)

export default useValgtFnr
