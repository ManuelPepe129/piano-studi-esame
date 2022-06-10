import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import API from './API';
import { LoginForm, LogoutButton } from './LoginComponents';
import { MainComponent } from './CourseComponents';
import { StudyPlanOptionForm, StudyPlanTable, StudyPlanActions } from './StudyPlanComponent';


function App() {
  return (
    <Router>
      <App2 />
    </Router>
  );
}

function App2() {
  const [courses, setCourses] = useState([]);
  const [incompatibilities, setIncompatibilities] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [studyPlan, setStudyPlan] = useState([]);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [fullTime, setFullTime] = useState(true);
  const [dirty, setDirty] = useState(false);


  function handleError(err) {
    setMessage(err.error);
    //console.log(err.error);
  }

  useEffect(() => {
    Promise.all([API.getAllCourses(), API.getAllIncompatibilities()])
      .then(responses => {
        setCourses(responses[0]);
        setIncompatibilities(responses[1]);
        setInitialLoading(false);
      })
      .catch(err => handleError(err));
  }, []);

  useEffect(() => {
    if (loggedIn && !initialLoading) {
      API.getStudyPlan()
        .then((sp) => {
          if (sp.length === 0) {
            setStudyPlan(sp);
          } else {
            const courses_tmp = courses.filter(course => sp.find(c => c.course === course.code))
              .map((course) => ({ code: course.code, name: course.name, credits: course.credits }));

            setStudyPlan(courses_tmp);
          }
        })
        .catch(err => handleError(err));
    }
  }, [loggedIn, initialLoading]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        // TODO: store them somewhere and use them, if needed
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        //handleError(err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (dirty) {
      API.getAllCourses()
        .then(courses => {
          setCourses(courses);
          setDirty(false);
        })
        .catch(err => handleError(err));
    }
  }, [dirty]);

  const updateStudyPlan = async (sp) => {

    if (studyPlan.length) {
      await deleteStudyPlan();
    }

    API.updateStudyPlan(sp)
      .then(() => {
        setStudyPlan(sp);
        setDirty(true);
      }).catch(err => handleError(err));
  }

  const deleteStudyPlan = () => {
    API.deleteStudyPlan()
      .then(() => {
        setStudyPlan([]);
        setDirty(true);
      }).catch(err => handleError(err));
  }

  const doLogin = (credentials) => {
    API.login(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        // navigate('/');
      })
      .catch(err => {
        handleError(err);
      });
  }

  const doLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser({});
    setStudyPlan([]);
  }

  return (
    <>
      <Container>
        <Row><Col>
          {loggedIn ? <LogoutButton logout={doLogout} user={user} /> : false}
        </Col></Row>
        <Row><Col>
          {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
        </Col></Row>


        <Routes>
          <Route path='/' element={
            initialLoading ? <Loading /> :
              loggedIn ? (<>
                {studyPlan.length ?
                  <>
                    <StudyPlanTable courses={studyPlan} />
                    <StudyPlanActions deleteStudyPlan={deleteStudyPlan} />
                  </>
                  : <StudyPlanOptionForm updateFullTime={setFullTime} />
                }
                <MainComponent courses={courses} incompatibilities={incompatibilities} editing={false} />
              </>)
                : <Navigate to='/login' />}
          />
          <Route path='/login' element={
            loggedIn ? <Navigate to='/' /> :
              <>
                <LoginForm login={doLogin}></LoginForm>
                <MainComponent courses={courses} incompatibilities={incompatibilities} />
              </>
          } />
          <Route path='/edit' element={
            loggedIn ? <>
              <MainComponent courses={courses} incompatibilities={incompatibilities} editing={true} fullTime={fullTime} updateStudyPlan={updateStudyPlan} studyPlan={studyPlan} updateMessage={setMessage} />
            </>
              : <Navigate to='/login' />
          } />
          < Route path='*' element={<h1>Page not found</h1>} />
        </Routes>
      </Container>
    </>
  );
}

function Loading(props) {
  return (
    <h2>Loading data ...</h2>
  )
}

export default App;
