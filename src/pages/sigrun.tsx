import React, { useState } from 'react'
import { Button, Label } from '@navikt/ds-react'
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useSigrun } from '../queryhooks/useSigrun'
import { useValgtFnr } from '../utils/useValgtFnr'

const SigrunPage = () => {
    const { fnr } = useValgtFnr()
    const [aar, setAar] = useState<string>()

    const { data: data } = useSigrun(fnr, aar, !!fnr && !!aar)

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
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
