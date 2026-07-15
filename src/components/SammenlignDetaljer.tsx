import React, { useState } from 'react'
import { ToggleGroup } from '@navikt/ds-react'

import { sammenlignObjekter, SammenlignRad } from '../utils/sammenlignUtils'

interface Props {
    tittel1: string
    tittel2: string
    objekt1: object
    objekt2: object
}

const radBakgrunn = (rad: SammenlignRad): string => {
    if (rad.verdi1 === undefined || rad.verdi2 === undefined) {
        return 'bg-surface-neutral-subtle'
    }
    if (!rad.erLik) return 'bg-surface-warning-subtle'
    return ''
}

const VerdiCelle = ({ verdi }: { verdi: string | undefined }) => {
    if (verdi === undefined) {
        return <span className="text-text-subtle italic">—</span>
    }
    return <span className="break-all">{verdi}</span>
}

export const SammenlignDetaljer = ({ tittel1, tittel2, objekt1, objekt2 }: Props) => {
    const [kunForskjeller, setKunForskjeller] = useState<'alle' | 'forskjeller'>('forskjeller')

    const rader = sammenlignObjekter(objekt1, objekt2)
    const filtrertRader = kunForskjeller === 'forskjeller' ? rader.filter((r) => !r.erLik) : rader

    const antallForskjeller = rader.filter((r) => !r.erLik).length

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <ToggleGroup
                    value={kunForskjeller}
                    onChange={(v) => setKunForskjeller(v as 'alle' | 'forskjeller')}
                    size="small"
                    variant="neutral"
                >
                    <ToggleGroup.Item value="forskjeller">Kun forskjeller ({antallForskjeller})</ToggleGroup.Item>
                    <ToggleGroup.Item value="alle">Alle felt ({rader.length})</ToggleGroup.Item>
                </ToggleGroup>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 w-[35%]">Felt</th>
                            <th className="text-left py-1.5 pr-3 font-semibold w-[32.5%]">{tittel1}</th>
                            <th className="text-left py-1.5 font-semibold w-[32.5%]">{tittel2}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtrertRader.map((rad) => (
                            <tr key={rad.nøkkel} className={radBakgrunn(rad)}>
                                <td className="py-1 pr-3 text-gray-500 font-mono text-xs align-top">{rad.nøkkel}</td>
                                <td className="py-1 pr-3 align-top">
                                    <VerdiCelle verdi={rad.verdi1} />
                                </td>
                                <td className="py-1 align-top">
                                    <VerdiCelle verdi={rad.verdi2} />
                                </td>
                            </tr>
                        ))}
                        {filtrertRader.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-4 text-center text-text-subtle italic">
                                    Ingen forskjeller funnet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
