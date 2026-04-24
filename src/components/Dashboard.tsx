import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  User as UserIcon,
  Settings as SettingsIcon,
  UsersRound,
  DollarSign,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  where, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Attendance, Result, Fee, Teacher, SchoolSettings, Announcement } from '../types';

function AnnouncementsModule({ announcements, isAdmin, refresh }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        createdAt: Date.now()
      });
      setIsAdding(false);
      setFormData({ title: '', content: '' });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
            {isAdding ? 'Cancel' : 'Post Update'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 overflow-hidden"
          >
            <input 
              placeholder="Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none"
              required
            />
            <textarea 
              placeholder="Message content..." 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none resize-none"
              rows={4}
              required
            />
            <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold">Post Announcement</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {announcements.map((a: any) => (
          <div key={a.id} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm group hover:border-stone-900 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-stone-900">{a.title}</h4>
              {isAdmin && (
                <button onClick={() => handleDelete(a.id)} className="p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className="text-stone-500 leading-relaxed text-sm mb-6 whitespace-pre-wrap">{a.content}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Posted {new Date(a.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // General State
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      if (isAdmin) {
        const studentSnap = await getDocs(collection(db, 'students'));
        const attendanceSnap = await getDocs(collection(db, 'attendance'));
        const resultSnap = await getDocs(collection(db, 'results'));
        const feeSnap = await getDocs(collection(db, 'fees'));
        const announcementSnap = await getDocs(collection(db, 'announcements'));
        const teacherSnap = await getDocs(collection(db, 'teachers'));
        const settingsSnap = await getDocs(collection(db, 'settings'));

        setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
        setAttendance(attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
        setResults(resultSnap.docs.map(d => ({ id: d.id, ...d.data() } as Result)));
        setFees(feeSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fee)));
        setAnnouncements(announcementSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        setTeachers(teacherSnap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
        
        if (!settingsSnap.empty) {
          setSchoolSettings(settingsSnap.docs[0].data() as SchoolSettings);
        }
      } else if (profile.role === 'teacher') {
        let assignedClass = profile.assignedClass;

        if (!assignedClass) {
          const q = query(collection(db, 'teachers'), where('email', '==', profile.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            assignedClass = (snap.docs[0].data() as Teacher).assignedClass;
            await updateDoc(doc(db, 'users', profile.uid), { role: 'teacher', assignedClass });
          }
        }

        if (assignedClass) {
          const qStudents = query(collection(db, 'students'), where('class', '==', assignedClass));
          const qAtt = query(collection(db, 'attendance'), where('class', '==', assignedClass));
          const qRes = query(collection(db, 'results'), where('class', '==', assignedClass));
          const qAnn = query(collection(db, 'announcements'));

          const [sSnap, attSnap, resSnap, annSnap] = await Promise.all([
            getDocs(qStudents),
            getDocs(qAtt),
            getDocs(qRes),
            getDocs(qAnn)
          ]);

          setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
          setAttendance(attSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
          setResults(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Result)));
          setAnnouncements(annSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        }
      } else {
        // Parent view
        let sId = profile.studentId;
        
        // Auto-link if needed
        if (!sId) {
          const q = query(collection(db, 'students'), where('parentEmail', '==', profile.email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            sId = snap.docs[0].id;
            await updateDoc(doc(db, 'users', profile.uid), { studentId: sId });
          }
        }

        if (sId) {
          const studentRef = doc(db, 'students', sId);
          const studentSnap = await getDoc(studentRef);
          if (studentSnap.exists()) {
            setStudents([{ id: studentSnap.id, ...studentSnap.data() } as Student]);
          }

          const qAttendance = query(collection(db, 'attendance'), where('studentId', '==', sId));
          const qResults = query(collection(db, 'results'), where('studentId', '==', sId));
          const qFees = query(collection(db, 'fees'), where('studentId', '==', sId));

          const [attSnap, resSnap, feeSnap] = await Promise.all([
            getDocs(qAttendance),
            getDocs(qResults),
            getDocs(qFees)
          ]);

          setAttendance(attSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)));
          setResults(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Result)));
          setFees(feeSnap.docs.map(d => ({ id: d.id, ...d.data() } as Fee)));

          const announcementSnap = await getDocs(collection(db, 'announcements'));
          setAnnouncements(announcementSnap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = isAdmin ? [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: UsersRound },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'results', label: 'Results', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] : [
    ...(profile?.role === 'teacher' ? [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'My Class', icon: Users },
      { id: 'attendance', label: 'Record Attendance', icon: Calendar },
      { id: 'results', label: 'Grade Students', icon: FileText },
    ] : [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'attendance', label: 'Attendance', icon: Calendar },
      { id: 'fees', label: 'Fees', icon: CreditCard },
      { id: 'results', label: 'Results', icon: FileText },
    ])
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-stone-900" />
      </div>
    );
  }

  const renderContent = () => {
    const isTeacher = profile?.role === 'teacher';
    switch (activeTab) {
      case 'overview': return <Overview stats={{ students, attendance, results, fees, teachers, announcements }} isAdmin={isAdmin} isTeacher={isTeacher} profile={profile} />;
      case 'students': 
        if (isAdmin) return <StudentsModule students={students} refresh={fetchData} />;
        if (isTeacher) return <ClassList students={students} />;
        return null;
      case 'teachers': return isAdmin ? <TeachersModule teachers={teachers} refresh={fetchData} /> : null;
      case 'attendance': return <AttendanceModule students={students} attendance={attendance} isAdmin={isAdmin || isTeacher} refresh={fetchData} />;
      case 'fees': return <FeesModule students={students} fees={fees} isAdmin={isAdmin} refresh={fetchData} />;
      case 'results': return <ResultsModule students={students} results={results} isAdmin={isAdmin || isTeacher} refresh={fetchData} />;
      case 'announcements': return <AnnouncementsModule announcements={announcements} isAdmin={isAdmin} refresh={fetchData} />;
      case 'settings': return isAdmin ? <SettingsModule settings={schoolSettings} refresh={fetchData} /> : null;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-stone-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 block md:hidden p-2 bg-white rounded-xl shadow-sm border border-stone-200"
      >
        <Menu size={20} className="text-stone-600" />
      </button>

      {/* Sidebar Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 flex flex-col md:relative md:translate-x-0 transition-transform duration-300",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-stone-200">
                  <CheckCircle size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-stone-900">SimpliSchool</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-stone-400 p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    activeTab === item.id 
                      ? "bg-stone-900 text-white shadow-md shadow-stone-100" 
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  <item.icon size={18} className={cn(activeTab === item.id ? "text-white" : "text-stone-400 group-hover:text-stone-600")} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-10 w-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-600 font-bold shrink-0">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-stone-900 truncate">{profile?.displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{profile?.role}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-12">
          <header className="mb-12">
            <h2 className="text-3xl font-bold text-stone-900 capitalize tracking-tight ring-offset-stone-50">
              {activeTab === 'overview' ? `Welcome, ${profile?.displayName?.split(' ')[0]}` : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-stone-500 mt-2 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components ---

function Overview({ stats, isAdmin, isTeacher, profile }: any) {
  const { students, attendance, fees, teachers, announcements } = stats;

  const totalStudents = students.length;
  const totalTeachers = teachers?.length || 0;
  const attendanceRate = totalStudents > 0 
    ? Math.round((attendance.filter((a: any) => a.status === 'present').length / (attendance.length || 1)) * 100) 
    : 0;
  
  const totalFeesCollected = fees
    .filter((f: any) => f.status === 'paid')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  // Chart Data: Monthly Fees
  const monthlyFeesData = fees.reduce((acc: any, f: any) => {
    const month = f.month;
    if (!acc[month]) acc[month] = { month, collected: 0, pending: 0 };
    if (f.status === 'paid') acc[month].collected += f.amount;
    else acc[month].pending += f.amount;
    return acc;
  }, {});
  const feesChartData = Object.values(monthlyFeesData);

  // Chart Data: Attendance Trend (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const attendanceTrendData = last7Days.map(date => {
    const dayRecords = attendance.filter((a: any) => a.date === date);
    const presentCount = dayRecords.filter((a: any) => a.status === 'present').length;
    const rate = dayRecords.length > 0 ? Math.round((presentCount / dayRecords.length) * 100) : 0;
    return { date, rate };
  });

  if (isAdmin) {
    return (
      <div className="space-y-10 focus-visible:outline-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Students" value={totalStudents} icon={Users} color="bg-blue-500" />
          <StatCard title="Teachers" value={totalTeachers} icon={UsersRound} color="bg-purple-500" />
          <StatCard title="Attendance" value={`${attendanceRate}%`} icon={Calendar} color="bg-emerald-500" />
          <StatCard title="Collections" value={`$${totalFeesCollected}`} icon={DollarSign} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-8 flex items-center gap-2">
              <DollarSign size={18} className="text-stone-400" />
              Fee Collections
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="collected" fill="#000" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-8 flex items-center gap-2">
              <Calendar size={18} className="text-stone-400" />
              Attendance Trends
            </h3>
            <div className="h-[300px] w-full text-stone-400">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-stone-900">Recent Enrolments</h3>
            <button className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            {students.slice(-4).reverse().map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-1 group cursor-pointer hover:bg-stone-50 rounded-2xl p-2 -mx-2 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{s.name}</p>
                    <p className="text-xs text-stone-500 font-medium">Class {s.class} • Joined {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-stone-300 group-hover:text-stone-900 transition-colors">
                   <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard title="My Students" value={totalStudents} icon={Users} color="bg-blue-600" />
          <StatCard title="Assigned Class" value={profile.assignedClass || 'None'} icon={CheckCircle} color="bg-stone-900" />
        </div>

        {announcements.length > 0 && (
          <div className="bg-stone-900 p-8 rounded-3xl text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <Bell size={20} className="text-stone-400" />
               <h3 className="text-lg font-bold">Latest Updates</h3>
             </div>
             <div className="space-y-4">
               {announcements.slice(0, 2).map((a: any) => (
                 <div key={a.id} className="border-l-2 border-stone-800 pl-4 py-1">
                   <p className="font-bold text-sm tracking-tight">{a.title}</p>
                   <p className="text-xs text-stone-400 mt-1 line-clamp-2">{a.content}</p>
                 </div>
               ))}
             </div>
          </div>
        )}
        
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6">Class Management</h3>
          <p className="text-stone-500 mb-8">You are managing <b>{totalStudents} students</b> in <b>{profile.assignedClass}</b>. Access the sidebar to record attendance or grade results.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {students.slice(0, 8).map((s: any) => (
               <div key={s.id} className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-stone-400 text-xs font-bold">{s.name.charAt(0)}</div>
                 <span className="text-sm font-semibold text-stone-700 truncate">{s.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }
  const myChild = students[0];
  const myFees = fees.filter((f: any) => f.status === 'unpaid');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl shadow-stone-200 relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-2 text-rose-100/50">Student Profile</p>
          <h3 className="text-2xl font-bold">{myChild?.name || 'No child assigned'}</h3>
          <p className="text-stone-400 text-sm mt-1">{myChild?.class}</p>
          <div className="mt-8 pt-8 border-t border-stone-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-rose-100/30 text-[10px] uppercase font-bold tracking-widest mb-1">Attendance</p>
              <p className="text-xl font-bold">{attendance.length > 0 ? Math.round((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100) : 0}%</p>
            </div>
            <div>
              <p className="text-rose-100/30 text-[10px] uppercase font-bold tracking-widest mb-1">Fees Status</p>
              <p className="text-xl font-bold">{myFees.length > 0 ? 'Due' : 'Cleared'}</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-12 -right-12 h-48 w-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm border-b-4 border-b-orange-200">
        <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center justify-between">
          Recent Attendance
          <Calendar size={18} className="text-stone-400" />
        </h3>
        <div className="space-y-4">
          {attendance.slice(-3).reverse().map((a: any) => (
            <div key={a.id} className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl">
              <span className="text-sm font-semibold text-stone-600">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                a.status === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              )}>
                {a.status}
              </span>
            </div>
          ))}
          {attendance.length === 0 && <p className="text-center text-stone-400 text-sm py-8 font-medium italic">No attendance records found.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110", color)}>
        <Icon size={22} />
      </div>
      <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-1">{title}</p>
      <p className="text-3xl font-bold text-stone-900 tracking-tight">{value}</p>
    </div>
  );
}

// --- Modules ---

function StudentsModule({ students, refresh }: { students: Student[], refresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: '', contact: '', parentEmail: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), {
        ...formData,
        createdAt: Date.now()
      });
      setIsAdding(false);
      setFormData({ name: '', class: '', contact: '', parentEmail: '' });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      await deleteDoc(doc(db, 'students', id));
      refresh();
    } catch (e) { console.error(e); }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all bg-white"
          />
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Student Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/5 text-sm transition-all"
                  placeholder="e.g. Alice Smith"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Class / Grade</label>
                <input 
                  required
                  value={formData.class}
                  onChange={e => setFormData({...formData, class: e.target.value})}
                  className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/5 text-sm transition-all"
                  placeholder="e.g. Grade 10-A"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Contact Info</label>
                <input 
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/5 text-sm transition-all"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Parent Email (for login)</label>
                <input 
                  type="email"
                  value={formData.parentEmail}
                  onChange={e => setFormData({...formData, parentEmail: e.target.value})}
                  className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/5 text-sm transition-all"
                  placeholder="parent@email.com"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-stone-100 transition-all hover:bg-stone-800">
              Create Student Record
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group hover:border-stone-900 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
                <UserIcon size={24} />
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="p-2 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h4 className="text-lg font-bold text-stone-900">{s.name}</h4>
            <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mt-1 mb-4">{s.class}</p>
            
            <div className="space-y-1 text-xs font-medium text-stone-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-stone-200 rounded-full" />
                {s.contact || 'No contact info'}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-stone-200 rounded-full" />
                {s.parentEmail || 'No parent email linked'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceModule({ students, attendance, isAdmin, refresh }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMark = async (studentId: string, status: 'present' | 'absent') => {
    const student = students.find((s: any) => s.id === studentId);
    if (!student) return;
    try {
      const existing = attendance.find((a: any) => a.studentId === studentId && a.date === selectedDate);
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), { status });
      } else {
        await addDoc(collection(db, 'attendance'), { studentId, date: selectedDate, status, class: student.class });
      }
      refresh();
    } catch (e) { console.error(e); }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-4">
          {attendance.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl transition-all hover:bg-stone-100/50 group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  a.status === 'present' ? "bg-emerald-500" : "bg-rose-500"
                )} />
                <span className="font-semibold text-stone-700">{new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <span className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm",
                a.status === 'present' ? "bg-white text-emerald-700" : "bg-white text-rose-700"
              )}>
                {a.status}
              </span>
            </div>
          ))}
          {attendance.length === 0 && <p className="text-center text-stone-400 py-12 font-medium italic">No attendance records found.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">Daily Log</h3>
          <p className="text-sm text-stone-500 font-medium">Mark students present or absent for the selected day</p>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-6 py-4 border border-stone-100 bg-stone-50 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-stone-900/5"
        />
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">
                <th className="px-8 py-6">Student</th>
                <th className="px-8 py-6">Class</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {students.map((s: any) => {
                const record = attendance.find((a: any) => a.studentId === s.id && a.date === selectedDate);
                return (
                  <tr key={s.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-stone-900">{s.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">{s.class}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleMark(s.id, 'present')}
                          className={cn(
                            "px-5 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                            record?.status === 'present' 
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" 
                              : "border-stone-100 text-stone-400 hover:border-stone-200"
                          )}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleMark(s.id, 'absent')}
                          className={cn(
                            "px-5 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                            record?.status === 'absent' 
                              ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100" 
                              : "border-stone-100 text-stone-400 hover:border-stone-200"
                          )}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FeesModule({ students, fees, isAdmin, refresh }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', amount: '', month: '', dueDate: '', status: 'unpaid' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'fees'), {
        ...formData,
        amount: Number(formData.amount)
      });
      setIsAdding(false);
      setFormData({ studentId: '', amount: '', month: '', dueDate: '', status: 'unpaid' });
      refresh();
    } catch (e) { console.error(e); }
  };

  const toggleStatus = async (id: string, current: string) => {
    try {
      await updateDoc(doc(db, 'fees', id), { status: current === 'paid' ? 'unpaid' : 'paid' });
      refresh();
    } catch (e) { console.error(e); }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        {fees.map((f: any) => (
          <div key={f.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                f.status === 'paid' ? "bg-emerald-500 shadow-emerald-100" : "bg-orange-500 shadow-orange-100"
              )}>
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{f.month} Fee</p>
                <p className="text-xs text-stone-500 font-medium">Due: {f.dueDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-stone-900 mb-1">${f.amount}</p>
              <span className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                f.status === 'paid' ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
              )}>
                {f.status}
              </span>
            </div>
          </div>
        ))}
        {fees.length === 0 && <p className="text-center text-stone-400 py-12 font-medium italic">No fee records found.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          Issue New Fee
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Student</label>
              <select 
                required
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Amount ($)</label>
              <input 
                required
                type="number"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
                placeholder="250.00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Month</label>
              <input 
                required
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
                placeholder="May 2026"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Due Date</label>
              <input 
                required
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold transition-all hover:bg-stone-800">
                Issue Fee
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">
              <th className="px-8 py-6">Student</th>
              <th className="px-8 py-6">Description</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium text-stone-600">
            {fees.map((f: any) => {
              const student = students.find((s: any) => s.id === f.studentId);
              return (
                <tr key={f.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-stone-900">{student?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{student?.class}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-semibold">{f.month} Fee</p>
                    <p className="text-[10px] text-stone-400">Due: {f.dueDate}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-stone-900">${f.amount}</span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleStatus(f.id, f.status)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        f.status === 'paid' ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                      )}
                    >
                      {f.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this fee?')) {
                          await deleteDoc(doc(db, 'fees', f.id));
                          refresh();
                        }
                      }}
                      className="p-2 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultsModule({ students, results, isAdmin, refresh }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', subject: '', marks: '', totalMarks: '', term: '', date: new Date().toISOString().split('T')[0] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s: any) => s.id === formData.studentId);
    if (!student) return;
    try {
      await addDoc(collection(db, 'results'), {
        ...formData,
        class: student.class,
        marks: Number(formData.marks),
        totalMarks: Number(formData.totalMarks)
      });
      setIsAdding(false);
      setFormData({ studentId: '', subject: '', marks: '', totalMarks: '', term: '', date: new Date().toISOString().split('T')[0] });
      refresh();
    } catch (e) { console.error(e); }
  };

  if (!isAdmin) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r: any) => (
          <div key={r.id} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-stone-50 px-3 py-1 rounded-lg">
                  {r.term}
                </span>
                <span className="text-[10px] font-bold text-stone-300">{r.date}</span>
              </div>
              <h4 className="text-xl font-bold text-stone-900 mb-2">{r.subject}</h4>
              <div className="mt-8 flex items-end gap-3 px-1">
                <span className="text-4xl font-bold text-stone-900 tracking-tight">{r.marks}</span>
                <span className="text-stone-300 font-bold mb-1">/ {r.totalMarks}</span>
                <span className="ml-auto text-emerald-500 font-bold text-sm mb-1">{Math.round((r.marks / r.totalMarks) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-stone-50 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.marks / r.totalMarks) * 100}%` }}
                  className="h-full bg-stone-900 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="text-center text-stone-400 py-12 font-medium italic col-span-full">No results published yet.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-stone-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          Enter New Marks
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Student</label>
              <select 
                required
                value={formData.studentId}
                onChange={e => setFormData({...formData, studentId: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Subject</label>
              <input 
                required
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Term</label>
              <input 
                required
                value={formData.term}
                onChange={e => setFormData({...formData, term: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
                placeholder="e.g. First Term"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Marks Obtained</label>
              <input 
                required
                type="number"
                value={formData.marks}
                onChange={e => setFormData({...formData, marks: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Marks</label>
              <input 
                required
                type="number"
                value={formData.totalMarks}
                onChange={e => setFormData({...formData, totalMarks: e.target.value})}
                className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 focus:bg-white text-sm outline-none"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold transition-all hover:bg-stone-800">
                Post Result
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100">
              <th className="px-8 py-6">Student</th>
              <th className="px-8 py-6">Subject / Term</th>
              <th className="px-8 py-6 text-center">Score</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium text-stone-600">
            {results.map((r: any) => {
              const student = students.find((s: any) => s.id === r.studentId);
              return (
                <tr key={r.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-stone-900">{student?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{student?.class}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-semibold">{r.subject}</p>
                    <p className="text-[10px] text-stone-400">{r.term}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-stone-900">{r.marks} / {r.totalMarks}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">{Math.round((r.marks / r.totalMarks) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this result?')) {
                          await deleteDoc(doc(db, 'results', r.id));
                          refresh();
                        }
                      }}
                      className="p-2 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeachersModule({ teachers, refresh }: { teachers: Teacher[], refresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', contact: '', assignedClass: '', subjects: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'teachers'), {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()),
        createdAt: Date.now()
      });
      setIsAdding(false);
      setFormData({ name: '', email: '', contact: '', assignedClass: '', subjects: '' });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete teacher record?')) return;
    try {
      await deleteDoc(doc(db, 'teachers', id));
      refresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02]"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add Teacher'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Teacher Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Assigned Class</label>
              <input value={formData.assignedClass} onChange={e => setFormData({...formData, assignedClass: e.target.value})} className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Subjects (comma separated)</label>
              <input value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} className="w-full px-5 py-3 border border-stone-100 rounded-xl bg-stone-50 text-sm outline-none" placeholder="Math, Science" />
            </div>
            <button type="submit" className="md:col-span-2 bg-stone-900 text-white py-4 rounded-xl font-bold">Add Staff Member</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teachers.map(t => (
          <div key={t.id} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm group hover:border-stone-900 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
                <UsersRound size={28} />
              </div>
              <button 
                onClick={() => handleDelete(t.id)}
                className="p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h4 className="text-xl font-bold text-stone-900">{t.name}</h4>
            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mt-1">{t.assignedClass || 'No Class Assigned'}</p>
            
            <div className="mt-8 pt-8 border-t border-stone-50 flex flex-wrap gap-2 text-stone-500 text-xs font-semibold">
              {t.subjects?.map((sub, i) => (
                <span key={i} className="bg-stone-100 px-3 py-1 rounded-full">{sub}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsModule({ settings, refresh }: any) {
  const [formData, setFormData] = useState({ schoolName: settings?.schoolName || '', contact: settings?.contact || '', address: settings?.address || '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(collection(db, 'settings'));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'settings'), { ...formData, updatedAt: Date.now() });
      } else {
        await updateDoc(doc(db, 'settings', snap.docs[0].id), { ...formData, updatedAt: Date.now() });
      }
      refresh();
      alert('Settings saved successfully');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSave} className="bg-white p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">School Name</label>
          <input 
            value={formData.schoolName}
            onChange={e => setFormData({...formData, schoolName: e.target.value})}
            className="w-full px-6 py-4 border border-stone-100 rounded-2xl bg-stone-50 text-base font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 transition-all"
            placeholder="e.g. Lincoln High School"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Contact Email / Phone</label>
          <input 
            value={formData.contact}
            onChange={e => setFormData({...formData, contact: e.target.value})}
            className="w-full px-6 py-4 border border-stone-100 rounded-2xl bg-stone-50 text-base font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 transition-all"
            placeholder="contact@school.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Address</label>
          <textarea 
            rows={3}
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full px-6 py-4 border border-stone-100 rounded-2xl bg-stone-50 text-base font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-stone-50 transition-all resize-none"
            placeholder="School physical address"
          />
        </div>
        <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-stone-100 hover:scale-[1.01] transition-all">
          Save Configuration
        </button>
      </form>
    </div>
  );
}

function ClassList({ students }: { students: Student[] }) {
  return (
    <div className="space-y-8 focus-visible:outline-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm transition-all hover:border-stone-900 group">
             <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all mb-4">
                <UserIcon size={24} />
              </div>
            <h4 className="text-lg font-bold text-stone-900">{s.name}</h4>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 mb-4">{s.class}</p>
            <div className="pt-4 border-t border-stone-50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-medium lowercase">Parent Contact</span>
                <span className="text-stone-900 font-bold">{s.contact || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-medium lowercase">Parent Email</span>
                <span className="text-stone-900 font-bold">{s.parentEmail || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-100 italic text-stone-400">
            No students found in your assigned class.
          </div>
        )}
      </div>
    </div>
  );
}
