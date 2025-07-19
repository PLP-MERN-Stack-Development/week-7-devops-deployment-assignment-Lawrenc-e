import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import BugList from './components/BugList';
import BugForm from './components/BugForm';
import BugDetail from './components/BugDetail';
import Dashboard from './components/Dashboard';
import { BugProvider } from './context/BugContext';

function App() {
  return (
    <BugProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bugs" element={<BugList />} />
              <Route path="/bugs/new" element={<BugForm />} />
              <Route path="/bugs/:id" element={<BugDetail />} />
              <Route path="/bugs/:id/edit" element={<BugForm />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </BugProvider>
  );
}

export default App;