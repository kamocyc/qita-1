import React from 'react';
// import {
//   Route,
//   BrowserRouter as Router,
//   Switch,
//   Redirect,
// } from "react-router-dom";
import MainBox from './MainBox';

class App extends React.Component {  
  render() {
    return (
      <MainBox />
      // <div className="App">
      //   <header className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <p>
      //       Edit <code>src/App.tsx</code> and save to reload.
      //     </p>
      //     <a
      //       className="App-link"
      //       href="https://reactjs.org"
      //       target="_blank"
      //       rel="noopener noreferrer"
      //     >
      //       Learn React
      //     </a>
      //   </header>
      // </div>
    );
  }
}

export default App;
