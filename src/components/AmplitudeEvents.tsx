import React, { useState } from 'react'
import { Alert, BodyShort, Button, Checkbox, TextField } from '@navikt/ds-react'
import dayjs from 'dayjs'

import { AmplitdudeEvent, useAmplitudedata } from '../queryhooks/useAmplitudedata'

const AmplitudeEvents = () => {
    const [fnr, setFnr] = useState<string>(localStorage.getItem('amplitude-id') || '')
    const [enabled, setEnabled] = useState<boolean>(false)
    const [visRaw, setVisRaw] = useState<boolean>(false)
    const { data: data, isLoading, isError } = useAmplitudedata(fnr, enabled)

    return (
        <div className="flex-row space-y-4">
            <TextField
                className="mt-4 w-1/5"
                onChange={(e) => {
                    setFnr(e.target.value)
                    localStorage.setItem('amplitude-id', e.target.value)
                    setEnabled(false)
                }}
                value={fnr}
                label="AmplitudeId"
                size="medium"
            />
            <Button onClick={() => setEnabled(true)}>Hent amplitudebruker</Button>
            <div>
                {isLoading && enabled && <span>Laster...</span>}
                {isError && <Alert variant="error">Noe gikk galt</Alert>}
                {data && (
                    <>
                        <BodyShort spacing>Viser {data.events.length} events</BodyShort>
                        {parseEvents(data.events).map((event) => {
                            const url = new Set<string>()
                            event.forEach((e) => {
                                url.add(e.event_properties.url)
                            })
                            // url to array
                            return (
                                <div key={event[0].event_id} className="mb-4">
                                    <BodyShort>
                                        {dayjs(event[0].client_event_time).format('D MMM YYYY HH:mm')}
                                    </BodyShort>
                                    {event.map((e, i) => {
                                        const eventer = [
                                            e.event_type,
                                            e.event_properties.component,
                                            e.event_properties.komponent,
                                            e.event_properties.tekst,
                                            e.event_properties.soknadstype,
                                            e.event_properties.spørsmål,
                                            e.event_properties.svar,
                                        ]
                                        if (e.event_properties.dagerSidenSisteUtbetaling !== undefined) {
                                            eventer.push(
                                                ` ${e.event_properties.dagerSidenSisteUtbetaling} dager siden siste utbetaling`,
                                            )
                                        }
                                        if (e.event_properties.dagerTilMaksdato !== undefined) {
                                            eventer.push(`${e.event_properties.dagerTilMaksdato} dager til maksdato`)
                                        }

                                        const tekst = eventer
                                            .filter((e) => !!e)
                                            .filter((e) => e !== 'besøk')
                                            .join(' - ')

                                        return (
                                            <>
                                                <BodyShort key={e.event_id + i}>{tekst}</BodyShort>
                                            </>
                                        )
                                    })}

                                    {Array.from(url).map((e, i) => {
                                        return (
                                            <>
                                                <BodyShort key={e + i}>{e}</BodyShort>
                                            </>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </>
                )}
                <Checkbox
                    checked={visRaw}
                    onClick={() => {
                        setVisRaw(!visRaw)
                    }}
                >
                    Vis rådata
                </Checkbox>
                {data && visRaw && (
                    <div>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}

function parseEvents(events: AmplitdudeEvent[]): AmplitdudeEvent[][] {
    // Sorter eventene etter tidspunkt, fra tidligst til senest
    const sortedEvents = events.sort((a, b) => {
        return dayjs(a.client_event_time).isBefore(dayjs(b.client_event_time)) ? -1 : 1
    })

    // Grupper eventer basert på tidsforskjell mindre enn 30ms
    const groupedEvents: AmplitdudeEvent[][] = []
    let currentGroup: AmplitdudeEvent[] = []

    sortedEvents.forEach((event, index) => {
        if (index === 0) {
            // Starter den første gruppen med det første eventet
            currentGroup.push(event)
        } else {
            const previousEvent = sortedEvents[index - 1]
            // Sjekk om tidsforskjellen mellom dette og forrige event er mindre enn 30ms
            if (
                dayjs(event.client_event_time).diff(dayjs(previousEvent.client_event_time), 'ms') < 30 &&
                event.event_properties.url == previousEvent.event_properties.url
            ) {
                // Legg til i nåværende gruppe
                currentGroup.push(event)
            } else {
                // Tidsforskjellen er større, start en ny gruppe
                groupedEvents.push(currentGroup)
                currentGroup = [event]
            }
        }
    })

    // Legg til den siste gruppen hvis den inneholder eventer
    if (currentGroup.length > 0) {
        groupedEvents.push(currentGroup)
    }

    return groupedEvents
}

export default AmplitudeEvents
