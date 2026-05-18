import React, { useSyncExternalStore, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Heading } from '@navikt/ds-react'
import { XMarkIcon, SplitHorizontalIcon, SidebarRightIcon, ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'

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
    plassering: 'bunn' | 'hoyre'
    setPlassering: React.Dispatch<React.SetStateAction<'bunn' | 'hoyre'>>
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

function DetaljerMedToggle({
    objekt,
    filter,
    setFilter,
}: {
    objekt: object
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) {
    const [visDetaljer, setVisDetaljer] = useState(false)

    return (
        <div className="space-y-4">
            <Button
                variant="tertiary"
                size="small"
                onClick={() => setVisDetaljer(!visDetaljer)}
                icon={visDetaljer ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
            >
                {visDetaljer ? 'Skjul' : 'Vis'} fullstendige detaljer
            </Button>
            {visDetaljer && <Detaljer objekt={objekt} filter={filter} setFilter={setFilter} />}
        </div>
    )
}

function DrawerInnholdRenderer({
    variant,
    filter,
    setFilter,
    plassering,
}: {
    variant: DrawerVariant
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    plassering: 'bunn' | 'hoyre'
}) {
    switch (variant.type) {
        case 'sykmelding':
        case 'soknad':
            if (plassering === 'bunn') {
                return (
                    <div className="flex h-full gap-6">
                        <div className="w-1/2 overflow-y-auto">{variant.periodeInfo}</div>
                        <div className="w-1/2 overflow-y-auto">
                            <DetaljerMedToggle objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                        </div>
                    </div>
                )
            }
            return (
                <div className="space-y-4">
                    {variant.periodeInfo}
                    <DetaljerMedToggle objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                </div>
            )
        case 'klippetSoknad':
            return <Detaljer objekt={variant.objekt} filter={filter} setFilter={setFilter} />
    }
}

export default function DetaljerDrawer({
    innhold,
    filter,
    setFilter,
    onLukk,
    plassering,
    setPlassering,
}: DetaljerDrawerProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
    const erApen = innhold !== null
    const erBunn = plassering === 'bunn'

    if (!mounted) return null

    const posisjonKlasser = erBunn
        ? [
              'fixed bottom-0 left-0 z-[99999] flex h-1/2 w-full flex-col',
              'border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
              'transition-transform duration-300 ease-in-out',
              erApen ? 'translate-y-0' : 'translate-y-full',
          ]
        : [
              'fixed top-0 right-0 z-[99999] flex h-full w-[500px] flex-col',
              'border-l border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.12)]',
              'transition-transform duration-300 ease-in-out',
              erApen ? 'translate-x-0' : 'translate-x-full',
          ]

    return createPortal(
        <div
            className={posisjonKlasser.join(' ')}
            style={{ backgroundColor: '#ffffff' }}
            role="dialog"
            aria-modal="true"
            aria-label={innhold?.tittel ?? 'Detaljer'}
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <Heading size="small">{innhold?.tittel ?? ''}</Heading>
                <div className="flex items-center gap-1">
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={erBunn ? <SidebarRightIcon aria-hidden /> : <SplitHorizontalIcon aria-hidden />}
                        onClick={() => setPlassering(erBunn ? 'hoyre' : 'bunn')}
                        aria-label={erBunn ? 'Bytt til høyre side' : 'Bytt til bunnen'}
                        title={erBunn ? 'Bytt til høyre side' : 'Bytt til bunnen'}
                    />
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={<XMarkIcon aria-hidden />}
                        onClick={onLukk}
                        aria-label="Lukk"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-hidden px-5 py-4 text-sm">
                {innhold && (
                    <DrawerInnholdRenderer
                        variant={innhold.variant}
                        filter={filter}
                        setFilter={setFilter}
                        plassering={plassering}
                    />
                )}
            </div>
        </div>,
        document.body,
    )
}
