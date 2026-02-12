import React, { useState } from 'react'
import { Button, Label, Search } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSigrun } from '../queryhooks/useSigrun'
import { handterFnrValidering } from '../utils/inputValidering'

const SigrunPage = () => {
    const [fnr, setFnr] = useState<string>()
    const [aar, setAar] = useState<string>()

    const { data: data } = useSigrun(fnr, aar, !!fnr && !!aar)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Fødselsnummer"
                onSearchClick={(input) => {
                    handterFnrValidering(input, setFnr)
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterFnrValidering(evt.currentTarget.value, setFnr)
                    }
                }}
            />
            <AarButton aar="2024" setAar={setAar} />
            <AarButton aar="2023" setAar={setAar} />
            <AarButton aar="2022" setAar={setAar} />
            <AarButton aar="2021" setAar={setAar} />
            <AarButton aar="2020" setAar={setAar} />
            <AarButton aar="2019" setAar={setAar} />
            <div>
                <Label>{aar}</Label>
                {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
            </div>
        </div>
    )
}

function AarButton({ aar, setAar }: { aar: string; setAar: (value: string) => void }) {
    return (
        <Button size="small" variant="secondary" onClick={() => setAar(aar)}>
            {aar}
        </Button>
    )
}

export const getServerSideProps = initialProps

export default SigrunPage
