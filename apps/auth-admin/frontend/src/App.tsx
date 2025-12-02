import { Helmet } from 'react-helmet-async';
import Router from './Router';

function App() {
    return (
        <>
            <Helmet>
                <title>INTERPROMODAL - Fleet Management System</title>
                <meta name="description" content="Comprehensive Fleet Maintenance Management System" />
            </Helmet>
            <Router />
        </>
    );
}

export default App;
