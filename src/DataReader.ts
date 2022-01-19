const UTFChunks = 4096

/** Binary data reader */
export class DataReader {
    /** The binary data */
    public bytes: Uint8Array
    /** The data view of the binary data */
    public view: DataView

    /** The data size */
    public size: number
    /** The flags of the data */
    public flags: number

    /** Current reading position */
    public position = 0

    public constructor(data: Uint8Array) {
        this.bytes = data
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength)

        const info = this.readInt()

        this.size = info & 0x3FFFFFFF
        this.flags = (info & 0xC0000000) >> 30
    }

    /** Read 8 bit integer */
    public read(): number {
        return this.view.getInt8(this._advance())
    }

    /** Read 8 bit unsigned integer */
    public readU(): number {
        return this.view.getUint8(this._advance())
    }

    /** Read 8 bit boolean */
    public readBool(): boolean {
        return this.read() !== 0
    }

    /** Read 16 bit integer */
    public readShort(): number {
        return this.view.getInt16(this._advance(2))
    }

    /** Read 16 bit unsigned integer */
    public readUShort(): number {
        return this.view.getUint16(this._advance(2))
    }

    /** Read 32 bit integer */
    public readInt(): number {
        return this.view.getInt32(this._advance(4))
    }

    /** Read 32 bit unsigned integer */
    public readUInt(): number {
        return this.view.getUint32(this._advance(4))
    }

    /** Read 32 bit float */
    public readFloat(): number {
        return this.view.getFloat32(this._advance(4))
    }

    /** Read 64 bit bigint long */
    public readBigLong(): bigint {
        return this.view.getBigInt64(this._advance(8))
    }

    /** Read 64 bit bigint unsigned long */
    public readBigULong(): bigint {
        return this.view.getBigUint64(this._advance(8))
    }

    /** Read 64 bit long */
    public readLong(): number {
        return Number(this.readBigLong())
    }

    /** Read 64 bit unsigned long */
    public readULong(): number {
        return Number(this.readBigULong())
    }

    /** Read 64 bit double */
    public readDouble(): number {
        return this.view.getFloat64(this._advance(8))
    }

    /** Read modified utf-8 string */
    public readUTF(): string {
        const len = this.readShort()

        let str = ""
        const chars: number[] = []
        const bytes = this.bytes.slice(this._advance(len), this.position)

        let index = 0

        while (index < len) {
            const char = bytes[index] & 0xff

            if (char > 127) break

            index++
            chars.push(char)

            if (chars.length >= UTFChunks) {
                str += String.fromCharCode(...chars)
                chars.length = 0
            }
        }

        while (index < len) {
            const char = bytes[index++] & 0xff

            switch (char >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    chars.push(char)
                    break
                case 12:
                case 13:
                    // 110xxxxx 10xxxxxx
                    {
                        const char2 = bytes[index++]
                        chars.push(((char & 0x1f) << 6) | (char2 & 0x3f))
                    }
                    break
                case 14:
                    // 1110xxxx 10xxxxxx 10xxxxxx
                    {
                        const char2 = bytes[index++]
                        const char3 = bytes[index++]
                        chars.push(((char & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
                    }
                    break
            }

            if (chars.length >= UTFChunks) {
                str += String.fromCharCode(...chars)
                chars.length = 0
            }
        }

        if (chars.length) {
            str += String.fromCharCode(...chars)
            chars.length = 0
        }

        return str
    }

    /** Read modified utf-8 string, if exist */
    public readNullableText(): string | undefined {
        const isExist = this.readBool()
        if (isExist) return this.readUTF()
    }

    private _advance(amount = 1): number {
        const before = this.position
        this.position += amount

        if (this.position - 4 > this.size) throw new RangeError("Unexpected position > size")

        return before
    }
}
