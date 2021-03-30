"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

console.log(`testJobID's: ${testJobIds[0]}`)

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Software Engineer",
    salary: 200000,
    equity: "0.064",
    company_handle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(
      {
        ...newJob,
        id: expect.any(Number),
      },
    );
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/**************************************findAll*/
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: 'Early years teacher',
        salary: 55000,
        equity: "0",
        company_handle: "c2",
        name: "C2",
        id: testJobIds[1],
      },
      {
        title: 'Energy engineer',
        salary: 62000,
        equity: "0.25",
        company_handle: "c3",
        name: "C3",
        id: testJobIds[2],
      },
      {
        title: 'Information officer',
        salary: 200000,
        equity: "0.02",
        company_handle: "c1",
        name: "C1",
        id: testJobIds[0],
      },
    ]);
  });
});

/**************************************get(id)*/

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      title: 'Information officer',
      salary: 200000,
      equity: "0.02",
      id: testJobIds[0],
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        num_employees: 1,
        logo_url: "http://c1.img",
      },
    });
  });

  test("job not found if no matching job id", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});