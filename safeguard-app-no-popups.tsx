import React, { useState } from 'react';
import { Shield, ArrowLeft, Phone, MapPin, Clock, User, FileText, AlertTriangle, CheckCircle, Calendar, Search, Filter } from 'lucide-react';

const SafeGuardApp = () => {
  const [currentView, setCurrentView] = useState('home');

  // Mock data for demonstration
  const policeStation = {
    name: "Central Police Station",
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 911-0000",
    emergency: "911",
    distance: "0.8 miles",
    rating: "4.5/5",
    availability: "24/7",
    officers: [
      {
        name: "Officer Sarah Johnson",
        badge: "12345",
        specialization: "Domestic Violence",
        contact: "+1 (555) 911-0001",
        availability: "On Duty"
      },
      {
        name: "Detective Mike Wilson",
        badge: "54321",
        specialization: "Harassment Cases",
        contact: "+1 (555) 911-0002",
        availability: "Available"
      }
    ]
  };

  const abuserDetails = {
    name: "John Doe",
    riskLevel: "High",
    incidentCount: 7,
    lastIncident: "2024-01-15",
    category: "Workplace Harassment",
    proofs: [
      {
        type: "Screenshot",
        description: "Threatening messages on social media",
        date: "2024-01-15",
        file: "screenshot_001.png"
      },
      {
        type: "Video",
        description: "Recorded verbal abuse incident",
        date: "2024-01-12",
        file: "video_evidence.mp4"
      },
      {
        type: "Document",
        description: "HR complaint filing",
        date: "2024-01-10",
        file: "hr_complaint.pdf"
      },
      {
        type: "Audio",
        description: "Voicemail threats",
        date: "2024-01-08",
        file: "voicemail_threat.mp3"
      }
    ],
    timeline: [
      {
        date: "2024-01-15",
        event: "Threatening social media messages",
        severity: "High"
      },
      {
        date: "2024-01-12",
        event: "Verbal confrontation at workplace",
        severity: "High"
      },
      {
        date: "2024-01-10",
        event: "Inappropriate emails sent",
        severity: "Medium"
      }
    ]
  };

  const reports = [
    {
      id: "RPT-2024-001",
      title: "Workplace Harassment Case",
      status: "Under Investigation",
      priority: "High",
      filedDate: "2024-01-15",
      officer: "Detective Mike Wilson",
      progress: 65,
      timeline: [
        {
          date: "2024-01-15",
          time: "09:00 AM",
          action: "Report Filed",
          description: "Initial complaint submitted with evidence",
          officer: "Officer Sarah Johnson",
          status: "completed"
        },
        {
          date: "2024-01-15",
          time: "11:30 AM",
          action: "Evidence Review",
          description: "Digital evidence analyzed and catalogued",
          officer: "Detective Mike Wilson",
          status: "completed"
        },
        {
          date: "2024-01-16",
          time: "02:00 PM",
          action: "Witness Interview",
          description: "Interviewed workplace colleagues",
          officer: "Detective Mike Wilson",
          status: "completed"
        },
        {
          date: "2024-01-18",
          time: "10:00 AM",
          action: "Suspect Questioning",
          description: "Scheduled interview with accused party",
          officer: "Detective Mike Wilson",
          status: "pending"
        },
        {
          date: "2024-01-20",
          time: "TBD",
          action: "Case Review",
          description: "Final case evaluation and recommendations",
          officer: "Detective Mike Wilson",
          status: "scheduled"
        }
      ]
    },
    {
      id: "RPT-2024-002",
      title: "Cyberstalking Incident",
      status: "Evidence Collection",
      priority: "Medium",
      filedDate: "2024-01-10",
      officer: "Officer Sarah Johnson",
      progress: 40,
      timeline: [
        {
          date: "2024-01-10",
          time: "03:00 PM",
          action: "Report Filed",
          description: "Online harassment complaint filed",
          officer: "Officer Sarah Johnson",
          status: "completed"
        },
        {
          date: "2024-01-12",
          time: "09:00 AM",
          action: "Digital Forensics",
          description: "IP tracking and digital footprint analysis",
          officer: "Tech Specialist",
          status: "in-progress"
        },
        {
          date: "2024-01-19",
          time: "TBD",
          action: "Legal Review",
          description: "Case review for prosecution eligibility",
          officer: "Detective Mike Wilson",
          status: "scheduled"
        }
      ]
    }
  ];

  const HomeView = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-purple-300" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-400/20 blur-xl animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-gray-200 bg-clip-text text-transparent mb-2">
          SafeGuard
        </h1>
        <p className="text-gray-300 max-w-md mx-auto">
          Your comprehensive safety companion for reporting and tracking harassment cases
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setCurrentView('police')}
          className="p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 hover:border-purple-400 transition-all duration-200 text-left group shadow-lg hover:shadow-purple-900/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors backdrop-blur-sm">
              <Phone className="w-6 h-6 text-purple-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">Police Station Details</h3>
              <p className="text-sm text-gray-400">Contact information and nearest officers</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentView('abuser')}
          className="p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 hover:border-red-400 transition-all duration-200 text-left group shadow-lg hover:shadow-red-900/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-red-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">Abuser Details & Proofs</h3>
              <p className="text-sm text-gray-400">Evidence and incident history</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentView('reports')}
          className="p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 hover:border-teal-400 transition-all duration-200 text-left group shadow-lg hover:shadow-teal-900/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors backdrop-blur-sm">
              <FileText className="w-6 h-6 text-teal-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">Report Tracking</h3>
              <p className="text-sm text-gray-400">Track your filed reports and their progress</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const PoliceStationView = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h2 className="text-2xl font-bold text-gray-100">Police Station Details</h2>
      </div>

      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-100">{policeStation.name}</h3>
            <p className="text-gray-300 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {policeStation.address}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {policeStation.distance} away • {policeStation.rating} rating
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{policeStation.availability}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Emergency: {policeStation.emergency}</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/50">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Call: {policeStation.phone}</span>
          </button>
        </div>

        <div>
          <h4 className="font-semibold text-gray-100 mb-3">Assigned Officers</h4>
          <div className="space-y-3">
            {policeStation.officers.map((officer, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-100">{officer.name}</h5>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full backdrop-blur-sm">
                    {officer.availability}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">Badge #{officer.badge}</p>
                <p className="text-sm text-gray-300 mb-2">Specialization: {officer.specialization}</p>
                <button className="flex items-center space-x-1 text-blue-300 text-sm hover:text-blue-200">
                  <Phone className="w-4 h-4" />
                  <span>{officer.contact}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AbuserDetailsView = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h2 className="text-2xl font-bold text-gray-100">Abuser Details & Evidence</h2>
      </div>

      {/* Risk Assessment Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{abuserDetails.name}</h3>
            <p className="text-gray-600">{abuserDetails.category}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              abuserDetails.riskLevel === 'High' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {abuserDetails.riskLevel} Risk
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{abuserDetails.incidentCount}</div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{abuserDetails.lastIncident}</div>
            <div className="text-sm text-gray-600">Last Incident</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
            File New Report
          </button>
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Request Protection Order
          </button>
        </div>
      </div>

      {/* Evidence Collection - Always Visible */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Evidence Collection ({abuserDetails.proofs.length} items)
        </h4>
        <div className="space-y-3">
          {abuserDetails.proofs.map((proof, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  proof.type === 'Screenshot' ? 'bg-blue-100 text-blue-600' :
                  proof.type === 'Video' ? 'bg-purple-100 text-purple-600' :
                  proof.type === 'Document' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{proof.description}</h5>
                  <p className="text-sm text-gray-600">{proof.type} • {proof.date}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Timeline - Always Visible */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Incident Timeline
        </h4>
        <div className="space-y-4">
          {abuserDetails.timeline.map((incident, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                incident.severity === 'High' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">{incident.event}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    incident.severity === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{incident.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportTrackingView = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Report Tracking</h2>
      </div>

      {/* Summary Stats - Always Visible */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-sm text-gray-600">Active Reports</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-teal-600">1</div>
          <div className="text-sm text-gray-600">Under Investigation</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">52%</div>
          <div className="text-sm text-gray-600">Avg. Progress</div>
        </div>
      </div>

      {/* Search and Filter - Always Visible */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Reports List - All Details Always Visible */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Report Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-600">Report ID: {report.id}</p>
                <p className="text-sm text-gray-600">Filed: {report.filedDate}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  report.status === 'Under Investigation' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
                <div className={`mt-2 px-2 py-1 rounded text-xs ${
                  report.priority === 'High' 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.priority} Priority
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{report.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${report.progress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Assigned Officer: {report.officer}
            </p>

            {/* Investigation Timeline - Always Visible */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Investigation Timeline</h4>
              <div className="space-y-3">
                {report.timeline.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        stepIndex + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">{step.action}</h5>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {step.date} {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Officer: {step.officer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="max-w-md mx-auto p-4">
        {currentView === 'home' && <HomeView />}
        {currentView === 'police' && <PoliceStationView />}
        {currentView === 'abuser' && <AbuserDetailsView />}
        {currentView === 'reports' && <ReportTrackingView />}
      </div>
    </div>
  );
};

export default SafeGuardApp;