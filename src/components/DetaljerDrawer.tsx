import React, { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Button, Heading } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'

import { Detaljer } from './Detaljer'
import { Filter } from './Filter'

type DrawerVariant =
    | { type: 'sykmelding'; objekt: object; periodeInfo: React.ReactNode }
    | { type: 'soknad'; objekt: object; periodeInfo: React.ReactNode }
    | { type: 'klippetSoknad'; objekt: object }

export interface DrawerInnhold {
    tittel: string
    variant: DrawerVariant
}

interface DetaljerDrawerProps {
    innhold: DrawerInnhold | null
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    onLukk: () => void
}

export function lagSykmeldingDrawerInnhold(sykmelding: object, periodeInfo: React.ReactNode): DrawerInnhold {
    return {
        tittel: 'Sykmelding',
        variant: { type: 'sykmelding', objekt: sykmelding, periodeInfo },
    }
}

export function lagSoknadDrawerInnhold(soknad: object, periodeInfo: React.ReactNode): DrawerInnhold {
    return {
        tittel: 'Søknad',
        variant: { type: 'soknad', objekt: soknad, periodeInfo },
    }
}

export function lagOppholdUtlandSoknadDrawerInnhold(soknad: object, periodeInfo: React.ReactNode): DrawerInnhold {
    return {
        tittel: 'Opphold utland søknad',
        variant: { type: 'soknad', objekt: soknad, periodeInfo },
    }
}

export function lagKlippetSoknadDrawerInnhold(klippetSoknad: object): DrawerInnhold {
    return {
        tittel: 'Klippet søknad',
        variant: { type: 'klippetSoknad', objekt: klippetSoknad },
    }
}

function DrawerInnholdRenderer({
    variant,
    filter,
    setFilter,
}: {
    variant: DrawerVariant
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) {
    switch (variant.type) {
        case 'sykmelding':
        case 'soknad':
            return (
                <div className="flex h-full gap-6">
                    <div className="w-1/2 overflow-y-auto">{variant.periodeInfo}</div>
                    <div className="w-1/2 overflow-y-auto">
                        <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                    </div>
                </div>
            )
        case 'klippetSoknad':
            return <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
    }
}

export default function DetaljerDrawer({ innhold, filter, setFilter, onLukk }: DetaljerDrawerProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
    const erApen = innhold !== null

    if (!mounted) return null

    return createPortal(
        <div
            className={[
                'fixed bottom-0 left-0 z-[99999] flex h-1/2 w-full flex-col bg-white',
                'border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
                'transition-transform duration-300 ease-in-out',
                erApen ? 'translate-y-0' : 'translate-y-full',
            ].join(' ')}
            role="dialog"
            aria-modal="true"
            aria-label={innhold?.tittel ?? 'Detaljer'}
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <Heading size="small">{innhold?.tittel ?? ''}</Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<XMarkIcon aria-hidden />}
                    onClick={onLukk}
                    aria-label="Lukk"
                />
            </div>
            <div className="flex-1 overflow-hidden px-5 py-4 text-sm">
                {innhold && <DrawerInnholdRenderer variant={innhold.variant} filter={filter} setFilter={setFilter} />}
            </div>
        </div>,
        document.body,
    )
}
