import './App.css';
import firebase from "firebase/app";
import { getAuth, FacebookAuthProvider, signInWithPopup, GoogleAuthProvider, signOut, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../src/Firebase.config'
import { useState } from 'react';


const app = initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    password: ''
  })
  const provider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();

  const handleGoogleSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL
        }
        setUser(signedInUser)
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }
  const handleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        const user = result.user;
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        console.log('fb user', user)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;     
        const email = error.customData.email;    
        const credential = FacebookAuthProvider.credentialFromError(error);       
      });
  }

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
      const signOutuser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: '',
        error: '',
        success: false
      }
      setUser(signOutuser)
    }).catch((error) => {
      // An error happened.
    });
  }
  const handleSubmit = (event) => {
    // console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          const user = userCredential.user;
          const newUserInfo = { ...user }
          newUserInfo.error = ''
          newUserInfo.success = true
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false
          setUser(newUserInfo)
        });
    }
    if (!newUser && user.email && user.password) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // Signed in           
          const user = userCredential.user;
          const newUserInfo = { ...user }
          newUserInfo.error = ''
          newUserInfo.success = true
          setUser(newUserInfo)
          console.log('signed in user info', user)
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false
          setUser(newUserInfo)
        });
    }

    event.preventDefault();
  }
  const handleChange = (event) => {
    let isFormValid = true;
    // console.log(event.target.name, event.target.value)
    if (event.target.name === 'email') {
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUserName = name => {
    const auth = getAuth();

    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      // Profile updated!
      // ...
      console.log('user name uploaded')
    }).catch((error) => {
      // An error occurred
      // ...
    });
  }


  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
          <button onClick={handleGoogleSignIn}>Sign In</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Log In Using Facebook</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleChange} placeholder="Your name" />}
        <br />
        <input type="text" name="email" onBlur={handleChange} placeholder="Email Address" required />
        <br />
        <input type="password" name="password" onBlur={handleChange} placeholder="type password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'logged in'} Successfully</p>
      }
    </div>
  );
}

export default App;
