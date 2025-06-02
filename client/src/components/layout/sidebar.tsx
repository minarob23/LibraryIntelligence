import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import Header from './header';
import { 
  BookOpen, 
  FileText, 
  Users, 
  UserCheck, 
  Repeat, 
  Award, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  active: boolean;
}

const SidebarItem = ({ icon, label, to, active }: SidebarItemProps) => {
  return (
    <Link href={to}>
      <div
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mx-2 transition duration-150 ease-in-out cursor-pointer
          ${active 
            ? 'bg-primary text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
      >
        <span className="mr-3 text-lg">{icon}</span>
        {label}
      </div>
    </Link>
  );
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  return (
    <div className="min-h-screen flex flex-col">
      <Header sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 z-10 w-64 md:relative md:translate-x-0 bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ease-in-out flex flex-col`}
          style={{ marginTop: '60px', height: 'calc(100vh - 60px)' }}
        >
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-center">
              <BookOpen className="text-primary-500 mr-2" size={24} />
              <h2 className="text-lg font-semibold">Library MS</h2>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              <li>
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  label="Dashboard"
                  to="/"
                  active={location === '/'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<BookOpen size={20} />}
                  label="Books"
                  to="/books"
                  active={location === '/books'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<Users size={20} />}
                  label="Borrowers"
                  to="/borrowers"
                  active={location === '/borrowers'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<UserCheck size={20} />}
                  label="Librarians"
                  to="/librarians"
                  active={location === '/librarians'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<Repeat size={20} />}
                  label="Borrowing"
                  to="/borrowing"
                  active={location === '/borrowing'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<Award size={20} />}
                  label="Membership"
                  to="/membership"
                  active={location === '/membership'}
                />
              </li>
              <li>
                <SidebarItem
                  icon={<Settings size={20} />}
                  label="Settings"
                  to="/settings"
                  active={location === '/settings'}
                />
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
          style={{ marginTop: '60px', height: 'calc(100vh - 60px)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;