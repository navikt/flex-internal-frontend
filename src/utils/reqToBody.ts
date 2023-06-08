import { Readable } from 'stream'

import { NextApiRequest } from 'next'

async function stream2buffer(req: NextApiRequest): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const stream = Readable.from(req)
        const buffer = Array<Uint8Array>()
        stream.on('data', (chunk) => buffer.push(chunk))
        stream.on('end', () => resolve(Buffer.concat(buffer)))
        stream.on('error', (err) => reject(`error converting stream - ${err}`))
    })
}

export async function reqToBody<T>(req: NextApiRequest): Promise<T> {
    const body = await stream2buffer(req)
    return JSON.parse(body.toString())
}
