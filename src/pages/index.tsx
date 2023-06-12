import React, { useState } from 'react'
import { BodyShort, TextField } from '@navikt/ds-react'
import { Timeline } from '@navikt/ds-react-internal'
import { PersonIcon } from '@navikt/ds-icons'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'

const Index = (): JSX.Element => {
    const [fnr, setFnr] = useState<string>()
    const { data: soknader } = useSoknader(fnr, fnr !== undefined)

    function fnrInput(fnrChange: string): void {
        setFnr(fnrChange.length == 11 ? fnrChange : undefined)
    }

    return (
        <>
            <TextField type="number" label="fnr" onChange={(e) => fnrInput(e.target.value)} />

            <BodyShort className="mt-4">Soknader for [ {fnr} ]:</BodyShort>

            <BodyShort as="ul">
                {soknader?.map((s, idx) => (
                    <BodyShort as="li" key={idx}>
                        {s.id}
                        {JSON.stringify(s)}
                    </BodyShort>
                ))}
            </BodyShort>
                

            { soknader && soknader?.length > 0 && 
            <Timeline   >
                <Timeline.Row label="Person" icon={<PersonIcon aria-hidden />}>
                    {soknader?.map((s, idx) => (
                        <Timeline.Period key={idx} start={s.fom} end={s.tom} status="success">
                            {s ?? null}

                        </Timeline.Period>
                    ))}
                </Timeline.Row>
            </Timeline>
}

            {/* <div className="min-w-[800px] overflow-x-auto">
                <Timeline>
                    <Timeline.Row label="Person" icon={<PersonIcon aria-hidden />}>
                        {soknader?.map((s: any, i) => {
                            return (
                                <Timeline.Period key={i} start={s.fom} end={s.tom} status="success">
                                    child
                                </Timeline.Period>
                            )
                        })}
                    </Timeline.Row>
                </Timeline>
            </div> */}
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
