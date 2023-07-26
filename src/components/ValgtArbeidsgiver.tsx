import { ToggleGroup } from '@navikt/ds-react'
import React from 'react'

import { ArbeidsgiverGruppering } from '../utils/gruppering'

export default function ValgtArbeidsgiver({
    arbeidsgiver,
    setArbeidsgiver,
    soknaderGruppertPaArbeidsgiver,
}: {
    arbeidsgiver: string
    setArbeidsgiver: (val: any) => void
    soknaderGruppertPaArbeidsgiver: Map<string, ArbeidsgiverGruppering>
}) {
    const arbeidsgivere = Array.from(soknaderGruppertPaArbeidsgiver.keys()).filter((org) => org.length === 9)

    return (
        <ToggleGroup
            label="Arbeidsgivere:"
            defaultValue={arbeidsgiver}
            onChange={(v) => setArbeidsgiver(v)}
            size="small"
        >
            <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
            {arbeidsgivere.map((org) => (
                <ToggleGroup.Item key={org} value={org}>
                    {org}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup>
    )
}
