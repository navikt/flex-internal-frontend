import React from 'react'
import { FilesIcon } from '@navikt/aksel-icons'

interface Props {
    tekster: string[]
}

export function DelperiodeListe({ tekster }: Props) {
    if (tekster.length <= 1) return null

    return (
        <div
            data-testid="delperiode-liste"
            className="rounded border border-ax-border-neutral-subtle bg-ax-bg-neutral-soft px-2 py-1.5"
        >
            <ul className="divide-y divide-ax-border-neutral-subtle">
                <li className="flex items-center gap-1.5 pb-0.5 text-ax-medium font-semibold text-ax-text-subtle">
                    <span className="flex items-center">
                        <FilesIcon aria-hidden fontSize="1rem" />
                    </span>
                    Perioder
                </li>
                {tekster.map((tekst, indeks) => (
                    <li key={`${tekst}-${indeks}`} className="py-0.5 pl-5 text-ax-medium text-ax-text-default">
                        {tekst}
                    </li>
                ))}
            </ul>
        </div>
    )
}
