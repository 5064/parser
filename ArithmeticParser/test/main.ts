import * as assert from "chai";
import { Main } from "../src/main";

let testcase = "1+2+3";
it(testcase, () => {
    assert.expect(Main.parse(testcase)).to.equal(6);
});