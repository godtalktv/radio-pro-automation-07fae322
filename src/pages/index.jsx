import Layout from "./Layout.jsx";

import Schedule from "./Schedule";

import Library from "./Library";

import Playlists from "./Playlists";

import AdminDashboard from "./AdminDashboard";

import Pricing from "./Pricing";

import AutoScheduler from "./AutoScheduler";

import BroadcastGuide from "./BroadcastGuide";

import Clockwheels from "./Clockwheels";

import Compliance from "./Compliance";

import Studio from "./Studio";

import Tutorials from "./Tutorials";

import Branding from "./Branding";

import Privacy from "./Privacy";

import Terms from "./Terms";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Schedule: Schedule,
    
    Library: Library,
    
    Playlists: Playlists,
    
    AdminDashboard: AdminDashboard,
    
    Pricing: Pricing,
    
    AutoScheduler: AutoScheduler,
    
    BroadcastGuide: BroadcastGuide,
    
    Clockwheels: Clockwheels,
    
    Compliance: Compliance,
    
    Studio: Studio,
    
    Tutorials: Tutorials,
    
    Branding: Branding,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Schedule />} />
                
                
                <Route path="/Schedule" element={<Schedule />} />
                
                <Route path="/Library" element={<Library />} />
                
                <Route path="/Playlists" element={<Playlists />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/AutoScheduler" element={<AutoScheduler />} />
                
                <Route path="/BroadcastGuide" element={<BroadcastGuide />} />
                
                <Route path="/Clockwheels" element={<Clockwheels />} />
                
                <Route path="/Compliance" element={<Compliance />} />
                
                <Route path="/Studio" element={<Studio />} />
                
                <Route path="/Tutorials" element={<Tutorials />} />
                
                <Route path="/Branding" element={<Branding />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}