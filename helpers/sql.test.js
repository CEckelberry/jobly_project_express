const { sqlForPartialUpdate } = require('./sql');

describe("sqlForPartialUpdate", () => {
    test("works: 1 item", () => {
        const result = sqlForPartialUpdate (
            { obj1: "ver1"},
            { obj1: "obj1", obj2: "obj2" }
        );
        expect(result).toEqual({
            setCols: "\"obj1\" = $1",
            values: ["ver1"],
        })
    });
});