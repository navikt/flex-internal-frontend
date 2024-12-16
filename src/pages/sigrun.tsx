import React, { useState } from 'react'
import { Button, Label, TextField } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import { initialProps } from '../initialprops/initialProps'
import { useSigrun } from '../queryhooks/useSigrun'

const SigrunPage = () => {
    const [fnr, setFnr] = useState<string>()
    const [aar, setAar] = useState<string>()

    const { data: data } = useSigrun(fnr, aar, !!fnr && !!aar)

    function AarButton({ aar }: { aar: string }) {
        return (
            <Button
                size="small"
                variant="secondary"
                onClick={() => {
                    setAar(aar)
                }}
            >
                {aar}
            </Button>
        )
    }

    return (
        <div className="flex-row space-y-4">
            <TextField
                label="Fnr"
                onChange={(e) => (e.target.value.length == 11 ? setFnr(e.target.value) : setFnr(undefined))}
            />
            <AarButton aar="2024" />
            <AarButton aar="2023" />
            <AarButton aar="2022" />
            <AarButton aar="2021" />
            <AarButton aar="2020" />
            <AarButton aar="2019" />
            <div>
                <Label>{aar}</Label>
                {data && <JsonView data={data} shouldExpandNode={allExpanded} style={defaultStyles} />}
            </div>
        </div>
    )
}

export const getServerSideProps = initialProps

export default SigrunPage
