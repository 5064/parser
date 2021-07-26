// パーサ関数の型
type Parser<T> = {
    (s: Source): T;
};

class Parsers {
    static satisfy = (f: Function) => {
        return (s: Source) => {
            const ch: string = s.peek();
            if (!f.call(undefined, ch)) {
                throw new Error(s.withPrefix("Not satisfy"));
            }
            s.next();
            return ch;
        };
    };

    // ParserFunctions
    static isDigit(char: string): boolean {
        return Number.isInteger(parseInt(char));
    }
    static isLetter(char: string): boolean {
        return Number.isNaN(parseInt(char));
    }
    static isAlphabet(char: string): boolean {
        return /[a-zA-Z]/.test(char);
    }
    static letterP: Parser<string> = Parsers.or(
        Parsers.satisfy(Parsers.isLetter),
        Parsers.throwError("Not letter")
    );
    static digitP: Parser<number> = Parsers.or(
        Parsers.satisfy(Parsers.isDigit),
        Parsers.throwError("Not digit")
    );
    static numberP: Parser<number> = Parsers.many1(Parsers.digitP);
    static alphaP: Parser<string> = Parsers.or(
        Parsers.satisfy(Parsers.isAlphabet),
        Parsers.throwError("Not alphabet")
    );
    // 引数と一致するか判定するParserを生成する（一文字）
    static charP(arg: string): Parser<string> {
        return this.or(
            this.satisfy((char) => char === arg),
            this.throwError(`'${arg}' is expected, but given`)
        );
    }
    // 引数と一致するか判定するParserを生成する（文字列）
    static stringP(arg: string): Parser<string> {
        return (s: Source) => {
            for (const char of arg) {
                this.or(
                    this.charP(char),
                    this.throwError(`'${arg}' is expected, but given`)
                ).call(undefined, s);
            }
            return arg;
        };
    }

    // ParserCombinators
    // パーサを結合するコンビネータ
    static sequence(...parsers: Parser<any>[]): Parser<string> {
        return (s: Source) => {
            let result: string = "";
            for (const p of parsers) {
                result += p.call(undefined, s);
            }
            return result;
        };
    }
    // 指定したパーサを0回以上適用して返すコンビネータ
    static many(p: Parser<any>): Parser<string> {
        return (s: Source) => {
            let result: string = "";
            // エラーになるまでparseする
            try {
                while (true) {
                    result += p.call(undefined, s);
                }
            } catch (error) {}
            return result;
        };
    }
    // 指定したパーサを1回以上適用して返すコンビネータ
    static many1(p: Parser<any>): Parser<ReturnType<typeof p>> {
        return this.sequence(p, this.many(p));
    }
    // 「または」を表現するコンビネータ
    static or(p1: Parser<any>, p2: Parser<any>): Parser<any> {
        return (s: Source) => {
            let result: string = "";

            const backup: Source = s.clone();
            /** or(左, 右)として、左のパーサが内部で複数のパーサから構成されるとき、
             *  そのうち1つでも成功してその後で失敗したなら、
             *  右のパーサは処理されずにエラーにする
             */
            try {
                result = p1.call(undefined, s);
            } catch (error) {
                if (!s.equals(backup)) {
                    throw new Error(s.withPrefix("Not satisfy"));
                }
                result = p2.call(undefined, s);
            }
            return result;
        };
    }

    // Parserに対するtryのような関数
    // バックトラックするには対象となるパーサをtryPで囲む
    static tryP(p: Parser<any>) {
        return (s: Source) => {
            let result = "";
            const backup: Source = s.clone();
            try {
                result = p.call(undefined, s);
            } catch (error) {
                s.revert(backup);
                throw error;
            }
            return result;
        };
    }

    // エラーを意図的にthrow
    // 指定したメッセージでパースを失敗を確定させるときにorと使う
    static throwError(message: string): Parser<unknown> {
        return (s: Source) => {
            throw new Error(s.withPrefix(message));
        };
    }

    static parseTest(p: Parser<unknown>, src: string) {
        const s = new Source(src);
        try {
            console.log(p.call(undefined, s));
        } catch (error) {
            console.log(error.message);
        }
    }

    static main(): void {
        const test: Parser<number> = this.numberP;

        this.parseTest(test, "abd"); // NG
        this.parseTest(test, "123");
    }
}

class Source {
    private s: string;
    private pos: number;
    private line: number; // for ErrorMessage
    private charIndex: number; // for ErrorMessage

    constructor(s: string) {
        this.s = s;
        this.pos = 0;
        this.line = 1;
        this.charIndex = 1;
    }

    peek(): string {
        if (this.pos >= this.s.length) {
            throw new Error(this.withPrefix("Too short"));
        }
        return this.s[this.pos];
    }

    next(): void {
        const char = this.peek();
        if (char === "\n") {
            ++this.line;
        }
        ++this.pos;
        ++this.charIndex;
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
            return false;
        } else {
            return this.s === src.s && this.pos === src.pos;
        }
    }
    // パースに失敗したとき、状態を巻き戻して別の方法でパースをやり直す(バックトラック)
    // Sourceの状態を元に戻せるようにする
    revert(src: Source): void {
        if (!(this.s === src.s)) {
            throw new Error(this.withPrefix("Can not revert"));
        }
        this.pos = src.pos;
    }

    withPrefix(error: string): string {
        let message = `[line ${this.line}, position ${this.charIndex}] ${error}`;
        if (this.s !== undefined && 0 <= this.pos && this.pos < this.s.length) {
            message += `: '${this.s[this.pos]}'`;
        }
        return message;
    }
}

export class ZeroDivisionError extends Error {
    constructor(e?: string) {
        super(e);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

Parsers.main();
