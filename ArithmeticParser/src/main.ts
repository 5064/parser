class Source {
    private str: string
    public pos: number

    constructor(str: string) {
        this.str = str
        this.pos = 0
    }

    public peek(): string {
        if (this.pos < this.str.length) {
            return this.str.charAt(this.pos)
        }
        return null
    }

    public next(): void {
        ++this.pos
    }
}

class Parser extends Source {
    constructor(str: string) {
        super(str)
    }

    public number(): number {
        let token: string = ""
        let char: string
        while ((char = this.peek()) != null && this.isDigit(char)) {
            token += parseInt(char)
            this.next()
        }
        return parseInt(token)
    }

    /**
     * expr = term, {("+", term) | ("-", term)}
     */
    public expr(): number {
        let x: number = this.term()
        while (true) {  // 構文解析と計算を分離せずにexprで処理しているのがポイント
            switch (this.peek()) {
                case "+":
                    this.next()
                    x += this.term()
                    continue
                case "-":
                    this.next()
                    x -= this.term()
                    continue
            }
            break
        }
        return x
    }

    /**
     * term = factor, {("*", factor) | ("/", factor)}
     * 
     * 項の計算
     * exprより優先度が高い乗算,除算をする
     */
    public term(): number {
        let x: number = this.factor()
        while (true) {
            switch (this.peek()) {
                case "*":
                    this.next()
                    x *= this.factor()
                    continue
                case "/":
                    this.next()
                    x /= this.factor()
                    continue
            }
            break
        }
        return x
    }

    /**
     * factor = ("(", expr, ")") | number
     * 
     * 括弧を実装するための因子(factor)層
     * 括弧の中はexprであるため、以下のように再帰が循環する
     * expr -> term -> factor -> expr -> ...
     */
    public factor(): number {
        if (this.peek() === '(') {
            this.next()
            const ret: number = this.expr()
            if (this.peek() === ')') {
                this.next()
            }
            return ret
        }
        return this.number()
    }

    /**
     * 0除算
     * javascript returns Infinity when 0 division
     * But I wanna throw "ZeroDivisionError"
     */
    // public divisionFactor(): number {
    //     if (this.peek() === '0') {
    //         throw new ZeroDivisionError();
    //     }
    //     return this.factor()
    // }

    private isDigit(char: string): boolean {
        return /^\d+$/.test(char)
    }
}

export class ZeroDivisionError extends Error {
    constructor(e?: string) {
        super(e);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class Main {
    public static parse(args: string) {
        return new Parser(args).expr()
    }
}