import * as assert from "chai";
import { Main } from "../src/main";

describe("正常系", () => {
    const testcases = [
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
            expr: "1-3-0",
            answer: -2
        },
        {
            expr: "2*4*8",
            answer: 64
        },
        {
            expr: "1+2*3",
            answer: 7
        },
        {
            expr: "2*4/8",
            answer: 1
        },
        {
            expr: "2-4/8",
            answer: 1.5
        },
    ]
    testcases.map((tc) => {
        it(`${tc.expr} = ${tc.answer}`, () => {
            assert.expect(Main.parse(tc.expr)).to.equal(tc.answer);
        })
    })
})