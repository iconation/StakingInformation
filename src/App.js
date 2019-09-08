import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import './table.css';
import StakingResult from './StakingResult'
import { Redirect } from 'react-router-dom'

const App = () => {
  const [address, setAddress] = useState('')
  const [clicked, setClicked] = useState(false)

  return (
    <div className="App">
      {clicked && <Redirect to={'/' + address} />}

      <header className="App-header">
        <font size="16">ICON Stake Information</font>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Input an ICON public address below:<br />
          <input className="inputAddress" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </p>
        <button className="buttonAddress" onClick={() => setClicked(true)}>Get Stake Information</button>

        <Switch>
          <Route exact path='/hx:address' component={StakingResult} />
        </Switch>

      </header>
    </div >
  );
}

export default App;
