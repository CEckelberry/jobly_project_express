"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/**Related functions for Jobs. */

class Job{
/**Create a job (from data), update db, return new job data
 * data should be {}
 * Returns {}
 * Throws BadRequestError if job already in database. */    

 static async create({ title, salary, equity, company_handle,}) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1 AND company_handle = $2`,
        [title, company_handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title} at company ${company_handle}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
        [
            title, 
            salary, 
            equity, 
            company_handle
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * 
   * Has filters you can add on that will allow you to filter by min salary, equity, and title
   * */

   static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle,
                        c.name
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;


  }
/**
 * Search jobs by id
 * @param {*} id 
 * @returns id, title, salary, equity, company_handle where id = search term
 */
  
  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees,
              logo_url
       FROM companies
       WHERE handle = $1`, [job.company_handle]);

    delete job.company_handle;
    job.company = companiesRes.rows[0];

    return job;
  }

  /**
   * Updates some job parameters based on ID
   * 
   * @param {*} id (job ID)
   * @param {*} data (data to update)
   * @returns {id, title, salary, equity, company_handle}
   */


  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    constjobIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${constjobIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }

}


module.exports = Job;