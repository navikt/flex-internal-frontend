import React, { useCallback, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Link, Switch } from '@navikt/ds-react'
import dayjs from 'dayjs'

import { AmplitudeResponse } from '../queryhooks/useAmplitudedata'

import { EventGruppeMedDetaljer, parseEvents } from './eventParsing'

export const AmplitudeScreenshotView = ({ data }: { data: AmplitudeResponse }) => {
    const parsedEvents = parseEvents(data.events)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [alertLukket, setAlertLukket] = useState(() => {
        const lukketDato = localStorage.getItem('alertLukketDato')
        if (lukketDato) {
            const lagretDato = dayjs(lukketDato)
            const forskjellIDager = dayjs().diff(lagretDato, 'day')

            // Sjekk om det har gått mer enn 14 dager
            return forskjellIDager < 14
        }
        return false
    })
    const [json, setJson] = useState(false)
    const [mobil, setMobil] = useState(false)
    const handlePrevious = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    }, [setCurrentIndex])

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, parsedEvents.length - 1))
    }, [setCurrentIndex, parsedEvents])

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === 'ArrowLeft') {
                handlePrevious()
            } else if (event.key === 'ArrowRight') {
                handleNext()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleNext, handlePrevious])

    if (parsedEvents.length === 0) {
        return <BodyShort>Ingen events</BodyShort>
    }
    const eventGruppe = parsedEvents[currentIndex]
    return (
        <>
            {!alertLukket && (
                <Alert
                    variant="warning"
                    size="small"
                    className="mb-4"
                    closeButton={true}
                    onClose={() => {
                        setAlertLukket(true)
                        localStorage.setItem('alertLukketDato', dayjs().toString()) // Lagrer tiden i millisekunder siden epoch
                    }}
                >
                    Screenshotsene er ikke en til en med eventene i de fleste tilfeller. Screenshots kan også bli
                    utdatert.
                </Alert>
            )}
            <div className="min-h-44">
                <BodyShort>{eventGruppe.tidspunkt.format('D MMM YYYY HH:mm:ss')}</BodyShort>
                <Link href={'https://' + eventGruppe.url} target="_blank">
                    {eventGruppe.url}
                </Link>
                {eventGruppe.eventTekster.map((e, i) => {
                    return (
                        <BodyShort key={i} className="py-0">
                            {e}
                        </BodyShort>
                    )
                })}
                <BodyShort>{eventGruppe.spormalTag}</BodyShort>
                <BodyShort>{eventGruppe.soknadstype}</BodyShort>
            </div>
            {json && <pre>{JSON.stringify(eventGruppe.events, null, 2)}</pre>}
            {!json && (
                <div className="">
                    <Screenshot eventgruppe={eventGruppe} mobil={mobil}></Screenshot>
                </div>
            )}
            <div className="space-x-4 fixed items-center inset-x-0 bottom-0 bg-ax-neutral-300 p-4 flex">
                <Button data-color="neutral" variant="primary" onClick={handlePrevious} disabled={currentIndex === 0}>
                    Forrige
                </Button>
                <BodyShort>
                    {currentIndex + 1}/{parsedEvents.length}
                </BodyShort>
                <Button
                    data-color="neutral"
                    variant="primary"
                    onClick={handleNext}
                    disabled={currentIndex === parsedEvents.length - 1}
                >
                    Neste
                </Button>
                <Switch
                    checked={mobil}
                    onClick={() => {
                        setMobil(!mobil)
                    }}
                >
                    Mobil
                </Switch>
                <Switch
                    checked={json}
                    onClick={() => {
                        setJson(!json)
                    }}
                >
                    JSON
                </Switch>
            </div>
        </>
    )
}

const Screenshot = ({ eventgruppe, mobil }: { eventgruppe: EventGruppeMedDetaljer; mobil: boolean }) => {
    const urlUtenTrailingSlash = eventgruppe.url?.replace(/\/$/, '')?.replace('https://', '')?.replace('http://', '')
    const plattform = mobil ? 'mobil' : 'desktop'

    function imagePng() {
        switch (urlUtenTrailingSlash) {
            case 'www.nav.no':
                return 'www.nav.no'

            case 'www.nav.no/kontaktoss':
                return 'www.nav.no.kontaktoss'

            case 'www.nav.no/minside':
                return 'www.nav.no.minside'

            case 'www.nav.no/min-side':
                return 'www.nav.no.min-side'

            case 'www.nav.no/minside/nb/varsler':
                return 'www.nav.no.minside.nb.varsler'

            case 'www.nav.no/minside/varsler':
                return 'www.nav.no.minside.nb.varsler'

            case 'www.nav.no/utlogget':
                return 'www.nav.no.utlogget'

            case 'www.nav.no/skriv-til-oss':
                return 'www.nav.no.skriv-til-oss'

            case 'person.nav.no/dokumentarkiv/tema/SYK':
                return 'person.nav.no.dokumentarkiv.tema.syk'

            case 'person.nav.no/dokumentarkiv/tema/SYM':
                return 'person.nav.no.dokumentarkiv.tema.sym'

            case 'person.nav.no/dokumentarkiv':
            case 'www.nav.no/dokumentarkiv':
                return 'person.nav.no.dokumentarkiv'

            default:
                if (urlUtenTrailingSlash?.startsWith('www.nav.no/syk/sykepengesoknad/soknader/[redacted]/')) {
                    return 'soknad-sporsmal'
                }
                return null
        }
    }

    function iframedUrl() {
        const demoSpmSide = eventgruppeTilDemoSporsmalSide(eventgruppe)
        if (demoSpmSide) {
            return demoSpmSide
        }

        switch (urlUtenTrailingSlash) {
            case 'www.nav.no/syk/sykefravaer':
                return 'https://demo.ekstern.dev.nav.no/syk/sykefravaer?testperson=syk-17-siden'

            case 'www.nav.no/syk/oppfolgingsplaner/sykmeldt':
                return 'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/sykmeldt'

            case 'www.nav.no/syk/sykepengesoknad':
                return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad'

            case 'www.nav.no/syk/sykepenger':
                if (eventgruppe.events.some((e) => e.event_type == 'skjema åpnet')) {
                    return 'https://demo.ekstern.dev.nav.no/syk/sykepenger?id=a147e9a9-0aa2-4f5f-a8e3-c16c901e4071'
                }
                return 'https://demo.ekstern.dev.nav.no/syk/sykepenger'

            case 'www.nav.no/syk/sykepengesoknad/avbrutt/[redacted]':
                return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/avbrutt/811d15b2-2a76-4623-9530-1ba55617e0a5?testperson=integrasjon-soknader'

            case 'www.nav.no/syk/meroppfolging/snart-slutt-pa-sykepengene':
                return 'https://demo.ekstern.dev.nav.no/syk/meroppfolging/snart-slutt-pa-sykepengene'

            case 'www.nav.no/syk/sykepengesoknad/kvittering/[redacted]':
                return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/kvittering/3848e75e-4069-4076-95c0-3f9f0b63e498?testperson=integrasjon-soknader'

            case 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]/1':
            case 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]':
                return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/soknader/faba11f5-c4f2-4647-8c8a-58b28ce2f3ef/1'

            default:
                return null
        }
    }

    const iframed = iframedUrl()
    if (iframed) {
        if (mobil) {
            return <iframe src={iframed} style={{ width: '390px', height: '844px' }} title="Iframed"></iframe>
        }
        return <iframe src={iframed} style={{ width: '100%', height: '70vh' }} title="Iframed"></iframe>
    }
    const filnavn = imagePng()
    if (filnavn) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                style={{ maxHeight: '70vh' }}
                src={'/static/amplitude/' + plattform + '/' + filnavn + '.png'}
                alt="screenshot"
            />
        )
    }
    return null
}

function eventgruppeTilDemoSporsmalSide(e: EventGruppeMedDetaljer): string | null {
    if (e.sidevisning !== 'soknadssporsmal') {
        return null
    }
    const soknadstype = e.soknadstype
    const sporsmal = e.spormalTag
    if (!soknadstype || !sporsmal) {
        return null
    }
    switch (soknadstype) {
        case 'ARBEIDSTAKERE': {
            const base =
                'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/soknader/faba11f5-c4f2-4647-8c8a-58b28ce2f3ef/'
            switch (sporsmal) {
                case 'ANSVARSERKLARING':
                    return base + '1'
                case 'TILBAKE_I_ARBEID':
                    return base + '2'
                case 'FERIE_V2':
                    return base + '3'
                case 'PERMISJON_V2':
                    return base + '4'
                case 'JOBBET_DU_GRADERT':
                    // TODO en annen base
                    return base + '5'
                case 'ARBEID_UNDERVEIS_100_PROSENT':
                    return base + '5'
                case 'ANDRE_INNTEKTSKILDER_V2':
                    return base + '6'
                case 'UTLAND_V2':
                    return base + '7'
                case 'TIL_SLUTT':
                    return base + '8'
            }
        }
    }

    return null
}
