const InitialSize = 2048

/** Binary data writer */
export class DataWriter {
    /** The binary data */
    public bytes = new Uint8Array(InitialSize)
    /** The data view of the binary data */
    public view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength)
    /** The binary data size */
    public size = 0

    /** Finish and get the binary data */
    public finish(flags?: number): Uint8Array {
        let info = this.size

        if (typeof flags === "number" && !isNaN(flags)) {
            info |= flags << 30
        }

        const bytes = new Uint8Array(4 + this.size)
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

        view.setInt32(0, info)
        bytes.set(this.bytes.slice(0, this.size), 4)

        this.size = 0

        return bytes
    }

    /** Write 8 bit integer */
    public write(int: number): void {
        this.view.setInt8(this._advance(), int)
    }

    /** Write 8 bit unsigned integer */
    public writeU(uint: number): void {
        this.view.setUint8(this._advance(), uint)
    }

    /** Write 8 bit boolean */
    public writeBool(bool: boolean): void {
        this.write(bool ? 1 : 0)
    }

    /** Write 16 bit integer */
    public writeShort(int: number): void {
        this.view.setInt16(this._advance(2), int)
    }

    /** Write 16 bit unsigned integer */
    public writeUShort(uint: number): void {
        this.view.setUint16(this._advance(2), uint)
    }

    /** Write 32 bit integer */
    public writeInt(int: number): void {
        this.view.setInt32(this._advance(4), int)
    }

    /** Write 32 bit unsigned integer */
    public writeUInt(uint: number): void {
        this.view.setUint32(this._advance(4), uint)
    }

    /** Write 32 bit float */
    public writeFloat(float: number): void {
        this.view.setFloat32(this._advance(4), float)
    }

    /** Write 64 bit bigint long */
    public writeBigLong(long: bigint): void {
        this.view.setBigInt64(this._advance(8), long)
    }

    /** Write 64 bit bigint unsigned long */
    public writeBigULong(ulong: bigint): void {
        this.view.setBigUint64(this._advance(8), ulong)
    }

    /** Write 64 bit long */
    public writeLong(long: number): void {
        this.writeBigLong(BigInt(long))
    }

    /** Write 64 bit unsigned long */
    public writeULong(ulong: number): void {
        this.writeBigULong(BigInt(ulong))
    }

    /** Write 64 bit double */
    public writeDouble(double: number): void {
        this.view.setFloat64(this._advance(8), double)
    }

    /** Write modified utf-8 string */
    public writeUTF(str: string): void {
        const strLength = str.length
        let utfLength = strLength

        for (let i = 0; i < strLength; i++) {
            const char = str.charCodeAt(i)
            if (char >= 0x80 || char === 0) {
                utfLength = (char >= 0x800) ? 2 : 1
            }
        }

        if (utfLength > 65535) throw new Error("String is too long (max 65535)")

        this.writeUShort(utfLength)
        this._ensure(utfLength)

        let index = 0

        for (; index < strLength; index++) {
            const char = str.charCodeAt(index)
            if (char >= 0x80 || char === 0) break
            this.writeU(char)
        }

        for (; index < strLength; index++) {
            const char = str.charCodeAt(index)

            if (char < 0x80 && char !== 0) {
                this.writeU(char)
            } else if (char >= 0x800) {
                this.writeU(0xe0 | ((char >> 12) & 0x0f))
                this.writeU(0x80 | ((char >> 6) & 0x3f))
                this.writeU(0x80 | ((char >> 0) & 0x3f))
            } else {
                this.writeU(0xc0 | ((char >> 6) & 0x1f))
                this.writeU(0x80 | ((char >> 0) & 0x3f))
            }
        }
    }

    /** Write modified utf-8 string, only if the provided value is a string */
    public writeNullableText(str?: string): void {
        this.writeBool(typeof str === "string")
        if (typeof str !== "string") return
        this.writeUTF(str)
    }

    private _advance(amount = 1): number {
        const before = this.size

        this._ensure(amount)
        this.size += amount

        return before
    }

    private _ensure(size: number): void {
        if (this.bytes.byteLength < this.size + size) {
            const bytes = new Uint8Array(this.size * 2)
            const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

            bytes.set(this.bytes)

            this.bytes = bytes
            this.view = view
        }
    }
}
