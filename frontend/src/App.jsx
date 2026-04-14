import { DataProvider } from './context/DataContext';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  )
}

export default App;
