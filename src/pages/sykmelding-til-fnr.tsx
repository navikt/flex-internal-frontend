import React, { useState } from 'react'
import { BodyShort, Search } from '@navikt/ds-react'
import { JsonView, defaultStyles } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSykmelding } from '../queryhooks/useSykmelding'
import { handterUuidValidering } from '../utils/inputValidering'

const holdNoderLukket = () => false

const SykmeldingTilFnrPage = () => {
    const [sykmeldingId, setSykmeldingId] = useState<string>()

    const { data: sykmeldingData } = useSykmelding(sykmeldingId, sykmeldingId !== undefined)
    const fnrForSykmelding = sykmeldingData?.fnr ?? sykmeldingData?.sykmelding?.pasient?.fnr

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Sykmelding ID"
                onSearchClick={(input) => {
                    handterUuidValidering(input, setSykmeldingId, undefined, 'Sykmelding ID må være en UUID på 36 tegn')
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterUuidValidering(
                            evt.currentTarget.value,
                            setSykmeldingId,
                            undefined,
                            'Sykmelding ID må være en UUID på 36 tegn',
                        )
                    }
                }}
            />
            {sykmeldingData?.sykmelding && <BodyShort>{'Fødselsnummer: ' + (fnrForSykmelding ?? 'mangler')}</BodyShort>}
            {sykmeldingData?.sykmelding && (
                <JsonView data={sykmeldingData.sykmelding} shouldExpandNode={holdNoderLukket} style={defaultStyles} />
            )}
        </div>
    )
}

export const getServerSideProps = initialProps

export default SykmeldingTilFnrPage
