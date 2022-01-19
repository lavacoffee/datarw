/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const { DataReader, DataWriter } = require("../")
const assert = require("assert/strict")

describe("@lavacoffee/datarw", () => {
    const base64 = "QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA=="
    const buffer = Buffer.from(base64, "base64")

    const data = {}
    const expected = {
        version: 2,
        title: "Rick Astley - Never Gonna Give You Up",
        author: "RickAstleyVEVO",
        length: 212000,
        identifier: "dQw4w9WgXcQ",
        isStream: false,
        uri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sourceName: "youtube",
        position: 0
    }

    it("Decode Data", () => {
        const reader = new DataReader(buffer)

        data.version = reader.read()
        data.title = reader.readUTF()
        data.author = reader.readUTF()
        data.length = reader.readLong()
        data.identifier = reader.readUTF()
        data.isStream = reader.readBool()
        data.uri = reader.readNullableText()
        data.sourceName = reader.readUTF()
        data.position = reader.readLong()

        assert.deepEqual(data, expected)
    })

    it("Encode Data", () => {
        const writer = new DataWriter()

        writer.write(expected.version)
        writer.writeUTF(expected.title)
        writer.writeUTF(expected.author)
        writer.writeLong(expected.length)
        writer.writeUTF(expected.identifier)
        writer.writeBool(expected.isStream)
        writer.writeNullableText(expected.uri)
        writer.writeUTF(expected.sourceName)
        writer.writeLong(expected.position)

        const bytes = writer.finish(1)

        assert.equal(Buffer.from(bytes).toString("base64"), base64)
    })
})
