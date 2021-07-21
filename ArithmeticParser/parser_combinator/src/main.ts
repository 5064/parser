// パーサ関数の型
type Parser = {
    (s: Source): string
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
    static sequence(...parsers: Parser[]): Parser {
        return (s: Source) => {
            let result: string = ""
            for (const p of parsers) {
                result += p.call(undefined, s)
            }
            return result
        }
    }
    // 指定したパーサを0回以上適用して返すコンビネータ
    static many(p: Parser) {
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

    static isDigit(s: string) {
        return Number.isInteger(parseInt(s))
    }
    static isLetter(s: string) {
        return Number.isNaN(parseInt(s))
    }

    static anyChar: any = Parsers.satisfy((s: string) => true)
    static letter: any = Parsers.satisfy(Parsers.isLetter)
    static digit: any = Parsers.satisfy(Parsers.isDigit)

    static char = (ch: string) => {
        return Parsers.satisfy(c => c === ch)
    }

    static parseTest(p: Parser, src: string) {
        const s = new Source(src)
        try {
            console.log(p.call(undefined, s))
        } catch (error) {
            console.log(error.message)
        }

    }

    static main(): void {
        const se: Parser = this.sequence(this.letter, this.digit, this.digit)
        this.parseTest(se, "abcd")
        this.parseTest(se, "123")
        this.parseTest(se, "a23")
        this.parseTest(se, "a2345")
        const many = this.many(this.digit)
        this.parseTest(many, "abc123")
        this.parseTest(many, "123abc")
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
}

export class ZeroDivisionError extends Error {
    constructor(e?: string) {
        super(e);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

Parsers.main()