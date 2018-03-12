import React, { Component } from 'react';
import Layout from './hoc/Layout/Layout';
import BurgerBuilder from "./containers/BurgerBuilder/BurgerBuilder";

class App extends Component {
  render() {
      console.log('Location: ' + window.location); //this is how to get the server address
    return (
      <div>
          <Layout>
              <BurgerBuilder />
          </Layout>
      </div>
    );
  }
}

export default App;
