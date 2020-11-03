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
        ++this.pos;
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
            console.log(char)
            token += parseInt(char)
            this.next()
        }
        return parseInt(token)
    }

    public expr(): number {
        let x: number = this.number()
        while (this.peek() === "+") {  // 構文解析と計算を分離せずにexprで処理しているのがポイント
            this.next();
            x += this.number()
        }
        return x
    }

    private isDigit(char: string): boolean {
        return /^\d+$/.test(char)
    }
}

class Main {
    static test(args: string) {
        console.log(`${args} = ${new Parser(args).expr()}`)
    }
    public static parse(args: string) {
        this.test(args)
    }
}

Main.test("12+3+5")