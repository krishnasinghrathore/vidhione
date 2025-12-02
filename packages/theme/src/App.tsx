import { Helmet } from 'react-helmet-async';

const APP_NAME = (import.meta as any).env?.VITE_APP_NAME || 'VidhiOne';
const APP_DESCRIPTION = (import.meta as any).env?.VITE_APP_DESCRIPTION || APP_NAME;

/**
 * Note: Routing is handled in packages/theme/src/main.tsx via RouterProvider.
 * This component only manages global head metadata.
 */
function App() {
    return (
        <>
            <Helmet>
                <title>{APP_NAME}</title>
                <meta name="description" content={APP_DESCRIPTION} />
            </Helmet>
        </>
    );
}

export default App;
