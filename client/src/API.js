/*
   All the API calls
*/

const APIURL = new URL('http://localhost:3001/api/');

async function getAllCourses() {
    // call: GET /api/courses

    const response = await fetch(new URL('courses', APIURL));
    const coursesJson = await response.json();
    if (response.ok) {
        return coursesJson.map((co) => ({ code: co.code, name: co.name, credits: co.credits, propedeuticcourse: co.propedeuticcourse, studentsenrolled: co.studentsenrolled, maxstudentsenrolled: co.maxstudentsenrolled }));
    } else {
        throw coursesJson;  // an object with the error coming from the server
    }
}

async function getAllIncompatibilities() {
    // call: GET /api/incompatibilities
    const response = await fetch(new URL('incompatibilities', APIURL));
    const incompatibilitiesJson = await response.json();
    if (response.ok) {
        return incompatibilitiesJson.map((i) => ({ coursea: i.coursea, courseb: i.courseb }));
    } else {
        throw incompatibilitiesJson;  // an object with the error coming from the server
    }
}

async function getStudyPlan() {
    // call: GET /api/studyplan
    const response = await fetch(new URL('studyplan', APIURL), { credentials: 'include' });
    const studyPlanJson = await response.json();
    if (response.ok) {
        return studyPlanJson;
    } else {
        throw studyPlanJson;  // an object with the error coming from the server
    }
}

async function addStudyPlan(studyPlan) {
    // call: POST /api/studyplan
    return new Promise((resolve, reject) => {
        fetch(new URL('studyplan', APIURL), {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studyPlan),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((message) => { reject(message); }) // error message in the response body
                    .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

async function deleteStudyPlan() {
    return new Promise((resolve, reject) => {
        fetch(new URL('studyplan', APIURL), {
            method: 'DELETE',
            credentials: 'include'
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json()
                    .then((message) => { reject(message); })
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

async function updateUserEnrollment(enrollment) {
    return new Promise((resolve, reject) => {
        fetch(new URL('studyplan/enrollment', APIURL), {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ enrollment: enrollment })
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                response.json()
                    .then((message) => reject(message))
                    .catch(() => { reject({ error: "Cannot parse server response." }) });
            }
        }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
    });
}

/* USER login API */

async function login(credentials) {
    let response = await fetch(new URL('sessions', APIURL), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetail = await response.json();
        throw errDetail;
    }
}

async function logout() {
    await fetch(new URL('sessions/current', APIURL), { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
    const response = await fetch(new URL('sessions/current', APIURL), { credentials: 'include' });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}


const API = { getAllCourses, getAllIncompatibilities, getStudyPlan, addStudyPlan, deleteStudyPlan, updateUserEnrollment, login, logout, getUserInfo };
export default API;