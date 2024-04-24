import React, { useCallback, useEffect, useState } from 'react'
import { Alert, BodyShort, Button, Link, Switch } from '@navikt/ds-react'

import { AmplitudeResponse } from '../queryhooks/useAmplitudedata'

import { EventGruppe, parseEvents } from './eventParsing'

export const AmplitudeScreenshotView = ({ data }: { data: AmplitudeResponse }) => {
    const parsedEvents = parseEvents(data.events)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [alertLukket, setAlertLukket] = useState(false)
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

    const eventGruppe = parsedEvents[currentIndex]
    return (
        <>
            {!alertLukket && (
                <Alert
                    variant="warning"
                    size="small"
                    className="mb-4"
                    closeButton={true}
                    onClose={() => setAlertLukket(true)}
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
            </div>
            {json && <pre>{JSON.stringify(eventGruppe.events, null, 2)}</pre>}
            {!json && (
                <div className="">
                    <Screenshot eventgruppe={eventGruppe} mobil={mobil}></Screenshot>
                </div>
            )}
            <div className="space-x-4 fixed items-center inset-x-0 bottom-0 bg-gray-200 p-4 flex">
                <Button variant="primary-neutral" onClick={handlePrevious} disabled={currentIndex === 0}>
                    Forrige
                </Button>
                <BodyShort>
                    {currentIndex + 1}/{parsedEvents.length}
                </BodyShort>
                <Button
                    variant="primary-neutral"
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

const Screenshot = ({ eventgruppe, mobil }: { eventgruppe: EventGruppe; mobil: boolean }) => {
    const urlUtenTrailingSlash = eventgruppe.url.replace(/\/$/, '')
    const plattform = mobil ? 'mobil' : 'desktop'

    function imagePng() {
        if (urlUtenTrailingSlash === 'www.nav.no') {
            return 'www.nav.no'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/kontaktoss') {
            return 'www.nav.no.kontaktoss'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/minside') {
            return 'www.nav.no.minside'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/min-side') {
            return 'www.nav.no.min-side'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/minside/nb/varsler') {
            return 'www.nav.no.minside.nb.varsler'
        }
        if (
            urlUtenTrailingSlash === 'person.nav.no/dokumentarkiv' ||
            urlUtenTrailingSlash === 'www.nav.no/dokumentarkiv'
        ) {
            return 'person.nav.no.dokumentarkiv'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/utlogget') {
            return 'www.nav.no.utlogget'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/skriv-til-oss') {
            return 'www.nav.no.skriv-til-oss'
        }
        if (urlUtenTrailingSlash === 'person.nav.no/dokumentarkiv/tema/SYK') {
            return 'person.nav.no.dokumentarkiv.tema.syk'
        }
        if (urlUtenTrailingSlash === 'person.nav.no/dokumentarkiv/tema/SYM') {
            return 'person.nav.no.dokumentarkiv.tema.sym'
        }
        if (
            urlUtenTrailingSlash.startsWith('www.nav.no/syk/sykepengesoknad/soknader/[redacted]/') &&
            urlUtenTrailingSlash !== 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]/1'
        ) {
            return 'soknad-sporsmal'
        }
        return null
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

    function iframedUrl() {
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykmeldinger/[redacted]') {
            return 'https://sykmeldinger.ekstern.dev.nav.no/syk/sykmeldinger/b4f4172f-4bb8-4512-b572-03f211b26f08'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykefravaer') {
            return 'https://demo.ekstern.dev.nav.no/syk/sykefravaer?testperson=syk-17-siden'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykmeldinger') {
            return 'https://sykmeldinger.ekstern.dev.nav.no/syk/sykmeldinger'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/oppfolgingsplaner/sykmeldt') {
            return 'https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/sykmeldt'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad') {
            return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepenger') {
            if (eventgruppe.events.some((e) => e.event_type == 'skjema åpnet')) {
                return 'https://demo.ekstern.dev.nav.no/syk/sykepenger?id=a147e9a9-0aa2-4f5f-a8e3-c16c901e4071'
            }
            return 'https://demo.ekstern.dev.nav.no/syk/sykepenger'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/avbrutt/[redacted]') {
            return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/avbrutt/811d15b2-2a76-4623-9530-1ba55617e0a5?testperson=integrasjon-soknader'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/meroppfolging/snart-slutt-pa-sykepengene') {
            return 'https://demo.ekstern.dev.nav.no/syk/meroppfolging/snart-slutt-pa-sykepengene'
        }
        if (urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/kvittering/[redacted]') {
            return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/kvittering/3848e75e-4069-4076-95c0-3f9f0b63e498?testperson=integrasjon-soknader'
        }
        if (
            urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]/1' ||
            urlUtenTrailingSlash === 'www.nav.no/syk/sykepengesoknad/soknader/[redacted]'
        ) {
            return 'https://demo.ekstern.dev.nav.no/syk/sykepengesoknad/soknader/faba11f5-c4f2-4647-8c8a-58b28ce2f3ef/1'
        }
        return null
    }

    const iframed = iframedUrl()
    if (iframed) {
        if (mobil) {
            return <iframe src={iframed} style={{ width: '390px', height: '844px' }} title="Iframed"></iframe>
        }
        return <iframe src={iframed} style={{ width: '100%', height: '70vh' }} title="Iframed"></iframe>
    }
    return null
}