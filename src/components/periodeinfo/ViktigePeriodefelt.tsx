import React from 'react'

import { DelperiodeListe } from './DelperiodeListe'
import { FeltKort } from './FeltKort'

interface ViktigFelt {
    etikett: string
    verdi: string | number
}

interface Props {
    viktigeFelt: ViktigFelt[]
    delperiodeTekster?: string[]
}

export default function ViktigePeriodefelt({ viktigeFelt, delperiodeTekster = [] }: Props) {
    return (
        <div className="space-y-1.5">
            <FeltKort viktigeFelt={viktigeFelt} />
            <DelperiodeListe tekster={delperiodeTekster} />
        </div>
    )
}
