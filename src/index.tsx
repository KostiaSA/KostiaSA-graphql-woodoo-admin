import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './global.css';
import './style.css';
import App from './App';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";


class Root extends Component<any> {
    render() {
        return (
            <Router>

                {/* <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/about">About</Link>
                            </li>
                            <li>
                                <Link to="/users">Users</Link>
                            </li>
                        </ul>
                    </nav> */}
                <App />

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                {/* <Switch>
                        <Route path="/about">
                            <div>about</div>
                        </Route>
                        <Route path="/users">
                            <div>users</div>
                        </Route>
                        <Route path="/">
                            <App />
                        </Route>
                    </Switch> */}

            </Router>
        )
    }
}

ReactDOM.render(<Root />, document.getElementById('root'));

