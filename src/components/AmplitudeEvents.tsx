import React, { useState } from 'react'
import { Alert, BodyShort, Button, Radio, RadioGroup, ReadMore, TextField } from '@navikt/ds-react'

import { useAmplitudedata } from '../queryhooks/useAmplitudedata'

import { parseEvents } from './eventParsing'
import { AmplitudeScreenshotView } from './AmplitudeScreenshotView'

const AmplitudeEvents = () => {
    const [fnr, setFnr] = useState<string>(localStorage.getItem('amplitude-id') || '')
    const [enabled, setEnabled] = useState<boolean>(false)
    const { data: data, isLoading, isError } = useAmplitudedata(fnr, enabled)
    const [visning, setVisning] = useState('screenshots')

    return (
        <div className="flex-row">
            <ReadMore header="Vis meny" defaultOpen={true} className="pb-4">
                <TextField
                    className="w-1/5 mb-4"
                    onChange={(e) => {
                        setFnr(e.target.value)
                        localStorage.setItem('amplitude-id', e.target.value)
                        setEnabled(false)
                    }}
                    value={fnr}
                    label="AmplitudeId"
                    size="medium"
                />
                <Button size="small" onClick={() => setEnabled(true)}>
                    Hent amplitudebruker
                </Button>
                <div>
                    {isLoading && enabled && <span>Laster...</span>}
                    {isError && <Alert variant="error">Noe gikk galt</Alert>}
                    {data && (
                        <>
                            <RadioGroup
                                size="small"
                                legend="Velg visning"
                                className="flex mb-4"
                                onChange={setVisning}
                                value={visning}
                            >
                                <Radio value="screenshots" className="mr-4">
                                    Screenshots
                                </Radio>
                                <Radio value="liste" className="mr-4">
                                    Event liste
                                </Radio>

                                <Radio value="raw">Rådata fra amplitude</Radio>
                            </RadioGroup>
                            <BodyShort>{data.events.length} events</BodyShort>
                            <BodyShort>
                                {data.userData.device} - {data.userData.os}
                            </BodyShort>
                            <BodyShort>
                                {data.userData.properties.vindushoyde} x {data.userData.properties.vindusbredde}
                            </BodyShort>
                        </>
                    )}
                </div>
            </ReadMore>
            {data && (
                <>
                    {visning == 'liste' && (
                        <>
                            {parseEvents(data.events).map((eventgruppe, i) => {
                                return (
                                    <div key={i} className="mb-4">
                                        <BodyShort>{eventgruppe.tidspunkt.format('D MMM YYYY HH:mm:ss')}</BodyShort>
                                        {eventgruppe.eventTekster.map((e, i) => {
                                            return (
                                                <>
                                                    <BodyShort key={'tekst' + i}>{e}</BodyShort>
                                                </>
                                            )
                                        })}
                                        <BodyShort>{eventgruppe.url}</BodyShort>
                                    </div>
                                )
                            })}
                        </>
                    )}
                    {visning == 'screenshots' && <AmplitudeScreenshotView data={data} />}
                    {visning == 'raw' && (
                        <div>
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AmplitudeEvents
