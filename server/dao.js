'use strict'

const sqlite = require('sqlite3');
const { Course } = require('./course');

const db = new sqlite.Database('courses.db', (err) => {
    if (err) throw err;
});

//get all courses
exports.listCourses = () => {
    return new Promise((resolve, reject) => {
        // const sql = "SELECT * FROM courses ORDER BY code";
        const sql = `SELECT code, name, credits, propedeuticcourse, maxstudentsenrolled, count(course) AS studentsenrolled 
            FROM courses C  LEFT JOIN studyplans S ON C.code = S.course 
            GROUP BY code
            ORDER BY name`;

        db.all(sql, [], (err, rows) => {
            if (err)
                reject(err);
            else {
                const courses = rows.map(row => new Course(row.code, row.name, row.credits, row.propedeuticcourse, row.maxstudentsenrolled, row.studentsenrolled));
                resolve(courses);
            }
        });
    })
}

exports.listIncompatibilities = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM incompatibilities ORDER BY coursea';

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const incompatibilities = rows.map(row => ({ coursea: row.coursea, courseb: row.courseb }));
                resolve(incompatibilities);
            }
        })
    })
}

//get study plan for current loggedin user
exports.listStudyPlan = (userId) => {
    return new Promise((resolve, reject) => {
        // const sql = "SELECT * FROM courses ORDER BY code";
        const sql = `SELECT course FROM studyplans WHERE userid=?`;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            else {
                const studyplan = rows;
                resolve(studyplan);
            }
        });
    })
}

// post study plan for current loggedin user
exports.addStudyPlan = (courses, userId) => {
    return new Promise((resolve, reject) => {
        for (const course of courses) {
            const sql = `INSERT INTO studyplans(userid, course) VALUES (?,?)`;
            db.run(sql, [userId, course.code], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(null);
                }
            })
        }
    })
}

// delete study plan for current loggedin user
exports.deleteStudyPlan = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM studyplans WHERE userid=?';
        db.run(sql, [userId], (err) => {
            if (err) {
                reject(err);
                return;
            } else
                resolve(null);
        });
    });
}

// update current user enrollment
exports.updateUserEnrollment = (sub, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET isFullTime=? WHERE id=?';
        db.run(sql, [sub, userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(null);
            }
        });
    });
}