import React from 'react'

interface ViktigFelt {
    etikett: string
    verdi: string | number
}

interface Props {
    viktigeFelt: ViktigFelt[]
    delperiodeTekster?: string[]
}

export default function ViktigePeriodefelt({ viktigeFelt, delperiodeTekster = [] }: Props) {
    return (
        <div className="space-y-1">
            <ul className="list-disc pl-5 text-sm">
                {viktigeFelt.map((felt) => (
                    <li key={felt.etikett}>{`${felt.etikett}: ${felt.verdi}`}</li>
                ))}
            </ul>
            {delperiodeTekster.length > 1 ? (
                <ul className="list-disc pl-5 text-sm">
                    {delperiodeTekster.map((tekst, indeks) => (
                        <li key={`${tekst}-${indeks}`}>{tekst}</li>
                    ))}
                </ul>
            ) : null}
        </div>
    )
}
