import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBugContext } from '../context/BugContext';
import { Bug, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
  const { stats, loading, fetchStats } = useBugContext();

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total Bugs',
      value: stats?.total || 0,
      icon: Bug,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Open',
      value: stats?.open || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Resolved',
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  const severityStats = [
    { label: 'Critical', value: stats?.critical || 0, color: 'bg-red-100 text-red-800' },
    { label: 'High', value: stats?.high || 0, color: 'bg-orange-100 text-orange-800' },
    { label: 'Medium', value: stats?.medium || 0, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Low', value: stats?.low || 0, color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your bug tracking system</p>
        </div>
        <Link to="/bugs/new" className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Report New Bug
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Breakdown</h2>
          <div className="space-y-3">
            {severityStats.map((severity, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{severity.label}</span>
                <span className={`badge ${severity.color}`}>
                  {severity.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/bugs/new"
              className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Report New Bug</p>
                  <p className="text-sm text-gray-600">Create a new bug report</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/bugs?status=open"
              className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">View Open Bugs</p>
                  <p className="text-sm text-gray-600">See all unresolved issues</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/bugs?severity=critical"
              className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Bug className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Critical Issues</p>
                  <p className="text-sm text-gray-600">High priority bugs requiring immediate attention</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;