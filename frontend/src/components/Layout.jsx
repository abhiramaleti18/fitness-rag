import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import './Layout.css';

function LayoutInner({ children }) {
    const { collapsed } = useSidebar();
    return (
        <div className="app-layout">
            <Sidebar />
            <div className={`app-layout-content ${collapsed ? 'app-layout-content-centered' : ''}`}>
                {children}
            </div>
        </div>
    );
}

export default function Layout({ children }) {
    return (
        <SidebarProvider>
            <LayoutInner>{children}</LayoutInner>
        </SidebarProvider>
    );
}