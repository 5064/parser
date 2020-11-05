import * as assert from "assert";
import { Main } from "../src/main";

it("hello", () => {
    assert.equal(Main.parse("1+2+3"), 6);
});