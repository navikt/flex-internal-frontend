import React, { useState } from 'react'
import { BodyShort, TextField } from '@navikt/ds-react'
import { Timeline } from '@navikt/ds-react-internal'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'

const Index = (): JSX.Element => {
    const [fnr, setFnr] = useState<string>()
    const { data: soknader } = useSoknader(fnr, fnr !== undefined)

    function fnrInput(fnrChange: string): void {
        setFnr(fnrChange.length == 11 ? fnrChange : undefined)
    }

    function Timelinje(): JSX.Element {
        if (soknader === undefined) {
            return <></>
        }

        return (
            <div className="min-w-[800px] overflow-x-auto">
                <Timeline>
                    {soknader?.map((s: any) => (
                        <Timeline.Row label="Søknad" key={s.id}>
                            <Timeline.Period start={s.fom} end={s.tom} status="success">
                                <ul>
                                    <li>sok id: {s.id}</li>
                                    <li>syk id: {s.sykmeldingId}</li>
                                    <li>status: {s.status}</li>
                                </ul>
                            </Timeline.Period>
                        </Timeline.Row>
                    ))}
                </Timeline>
            </div>
        )
    }

    return (
        <>
            <TextField type="number" label="fnr" onChange={(e) => fnrInput(e.target.value)} />

            <BodyShort className="mt-4">Soknader for [ {fnr} ]:</BodyShort>

            <BodyShort as="ul">
                {soknader?.map((s, idx) => (
                    <BodyShort as="li" key={idx}>
                        {s.id}
                    </BodyShort>
                ))}
            </BodyShort>

            <Timelinje />
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
