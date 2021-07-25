// パーサ関数の型
type Parser<T> = {
    (s: Source): T
}

class Parsers {
    static satisfy = (f: Function) => {
        return (s: Source) => {
            const ch: string = s.peek()
            if (!f.call(undefined, ch)) {
                throw new Error("Not satisfy");
            }
            s.next()
            return ch
        }
    }

    // パーサを結合するコンビネータ
    static sequence(...parsers: Parser<any>[]): Parser<string> {
        return (s: Source) => {
            let result: string = ""
            for (const p of parsers) {
                result += p.call(undefined, s)
            }
            return result
        }
    }
    // 指定したパーサを0回以上適用して返すコンビネータ
    static many(p: Parser<any>) {
        return (s: Source) => {
            let result: string = ""
            // エラーになるまでparseする
            try {
                while (true) {
                    result += p.call(undefined, s)
                }
            } catch (error) {
            }
            return result
        }
    }
    // 「または」を表現するコンビネータ
    static or(p1: Parser<any>, p2: Parser<any>) {
        return (s: Source) => {
            let result: string = ""

            const backup: Source = s.clone()
            try {
                result = p1.call(undefined, s)
            } catch (error) {
                /** or(左, 右)として、左のパーサが内部で複数のパーサから構成されるとき、
                 *  そのうち1つでも成功してその後で失敗したなら、
                 *  右のパーサは処理されずにエラーにする
                 */
                if (!s.equals(backup)) {
                    throw new Error("Not satisfy");
                }
                result = p2.call(undefined, s)
            }
            return result
        }
    }

    static isDigit(char: string): boolean {
        return Number.isInteger(parseInt(char))
    }
    static isLetter(char: string): boolean {
        return Number.isNaN(parseInt(char))
    }
    static isAlphabet(char: string): boolean {
        return /[a-zA-Z]/.test(char)
    }

    static letter: Parser<string> = Parsers.satisfy(Parsers.isLetter)
    static digit: Parser<string> = Parsers.satisfy(Parsers.isDigit)
    static alpha: Parser<string> = Parsers.satisfy(Parsers.isAlphabet)

    // バックトラックするには対象となるパーサをtryPで囲む
    static tryP(p: Parser<any>) {
        return (s: Source) => {
            let result = ""
            const backup: Source = s.clone()
            try {
                result = p.call(undefined, s)
            } catch (error) {
                s.revert(backup)
                throw error;
            }
            return result
        }
    }

    static parseTest(p: Parser<string>, src: string) {
        const s = new Source(src)
        try {
            console.log(p.call(undefined, s))
        } catch (error) {
            console.log(error.message)
        }

    }

    static main(): void {
        const or: Parser<string> = this.or(this.tryP(this.sequence(this.digit, this.digit)), this.sequence(this.digit, this.alpha))

        this.parseTest(or, "2!")
        this.parseTest(or, "2A")
    }

}

class Source {
    private s: string
    private pos: number

    constructor(s: string) {
        this.s = s
        this.pos = 0
    }

    peek(): string {
        return this.s[this.pos]
    }

    next(): void {
        ++this.pos
    }

    // パーサの状態を保持できるようにする
    clone(): Source {
        const source = new Source(this.s);
        source.pos = this.pos;
        return source;
    }
    // パーサの状態を比較できるようにする
    equals(src: any): boolean {
        if (!(src instanceof Source)) {
            return false
        } else {
            return this.s === src.s && this.pos === src.pos
        }
    }
    // パースに失敗したとき、状態を巻き戻して別の方法でパースをやり直す(バックトラック)
    // Sourceの状態を元に戻せるようにする
    revert(src: Source) {
        if (!(this.s === src.s)) {
            throw new Error("Can not revert");
        }
        this.pos = src.pos
    }
}

export class ZeroDivisionError extends Error {
    constructor(e?: string) {
        super(e);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

Parsers.main()