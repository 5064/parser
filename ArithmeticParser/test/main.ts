import { expect } from "chai";
import { describe, it } from "mocha";
import { Main, ZeroDivisionError } from "../src/main";

describe("Normal usecases", () => {
    const testcases = [
        {
            expr: "666",
            answer: 666
        },
        {
            expr: "0+1+2+3",
            answer: 6
        },
        {
            expr: "3-2-1-0",
            answer: 0
        },
        {
            expr: "1+3-5",
            answer: -1
        },
        {
            expr: "2*4*8",
            answer: 64
        },
        {
            expr: "10+20*30",
            answer: 610
        },
        {
            expr: "10*20+30",
            answer: 230
        },
        {
            expr: "2-4/8",
            answer: 1.5
        },
        {
            expr: "(4+5)*6",
            answer: 54
        },
        {
            expr: "4+(5*6)",
            answer: 34
        },
        {
            expr: "(2-4)*8/16",
            answer: -1
        },
        {
            expr: "2*(4/(6-8))",
            answer: -4
        },
    ]
    testcases.map((tc) => {
        it(`${tc.expr} = ${tc.answer}`, () => {
            expect(Main.parse(tc.expr)).to.equal(tc.answer);
        })
    })
})

describe("Exceptional usecases", () => {
    describe("Zero division", () => {
        const expr1 = "1/0";
        it(`${expr1} throw ZeroDivisionError`, () => {
            expect(() => Main.parse(expr1)).to.throw(ZeroDivisionError);
        })
        const expr2 = "2/3*(4-4)";
        it(`${expr2} throw ZeroDivisionError`, () => {
            expect(Main.parse(expr2)).to.throw(ZeroDivisionError);
        })
    })
})