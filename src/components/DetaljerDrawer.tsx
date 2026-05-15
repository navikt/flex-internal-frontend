import React, { useSyncExternalStore, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Heading } from '@navikt/ds-react'
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'

import { Detaljer } from './Detaljer'
import { Filter } from './Filter'

const Z_DRAWER = 99999
const DRAWER_WIDTH = 500

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
            return (
                <div className="space-y-4">
                    {variant.periodeInfo}
                    <DetaljerMedToggle objekt={variant.objekt} filter={filter} setFilter={setFilter} />
                </div>
            )
        case 'soknad':
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
            style={{
                position: 'fixed',
                top: 0,
                right: erApen ? 0 : -DRAWER_WIDTH,
                width: DRAWER_WIDTH,
                height: '100%',
                zIndex: Z_DRAWER,
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'right 0.3s ease-in-out',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={innhold?.tittel ?? 'Detaljer'}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '12px 20px',
                }}
            >
                <Heading size="small">{innhold?.tittel ?? ''}</Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<XMarkIcon aria-hidden />}
                    onClick={onLukk}
                    aria-label="Lukk"
                />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '0.875rem' }}>
                {innhold && (
                    <DrawerInnholdRenderer variant={innhold.variant} filter={filter} setFilter={setFilter} />
                )}
            </div>
        </div>,
        document.body,
    )
}
