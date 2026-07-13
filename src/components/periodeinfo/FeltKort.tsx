import React from 'react'
import { CopyButton, Tag } from '@navikt/ds-react'

import { hentIkon, hentStatusFarge } from './periodefelt-utils'

interface ViktigFelt {
    etikett: string
    verdi: string | number
}

interface Props {
    viktigeFelt: ViktigFelt[]
}

export function FeltKort({ viktigeFelt }: Props) {
    return (
        <div
            data-testid="felt-kort"
            className="rounded border border-ax-border-info-subtle bg-ax-bg-info-soft px-2 py-1.5"
        >
            <ul className="divide-y divide-ax-border-info-subtle">
                {viktigeFelt.map((felt) => (
                    <li key={felt.etikett} className="flex items-center gap-2 px-1 py-0.5 text-sm">
                        <span className="flex shrink-0 items-center text-ax-text-subtle">{hentIkon(felt.etikett)}</span>
                        <span className="shrink-0 text-ax-medium text-ax-text-subtle">{felt.etikett}:</span>
                        <span className="flex min-w-0 flex-1 items-center gap-1">
                            {felt.etikett === 'Status' ? (
                                <Tag
                                    size="xsmall"
                                    variant="moderate"
                                    data-color={hentStatusFarge(felt.verdi as string)}
                                >
                                    {felt.verdi}
                                </Tag>
                            ) : (
                                <span
                                    className="truncate text-ax-text-default"
                                    title={typeof felt.verdi === 'string' ? felt.verdi : undefined}
                                >
                                    {felt.verdi}
                                </span>
                            )}
                            {(felt.etikett.toLowerCase().endsWith(' id') ||
                                felt.etikett.toLowerCase().startsWith('id')) && (
                                <CopyButton size="xsmall" copyText={String(felt.verdi)} />
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
