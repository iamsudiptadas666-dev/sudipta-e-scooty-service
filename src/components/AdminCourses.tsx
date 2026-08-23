import React, { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Edit2, Trash2, Video, Phone, Save, Search, CheckCircle2, AlertCircle, X, Globe, Coins, ShieldAlert, BookOpenCheck, Play, HelpCircle
} from "lucide-react";
import { Language } from "../translations";
import { Course } from "../types";

interface AdminCoursesProps {
  lang: Language;
  onCoursesChange?: (courses: Course[]) => void;
  whatsappNumber?: string;
  onUpdateWhatsapp?: (num: string) => void;
}

const DEFAULT_COURSES: Course[] = [];

export default function AdminCourses({ lang, onCoursesChange, whatsappNumber = "9064517009", onUpdateWhatsapp }: AdminCoursesProps) {
  const isBng = lang === "bn";

  // Load courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("sudipta_academy_courses");
    return saved ? JSON.parse(saved) : DEFAULT_COURSES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsappNumber);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [formTitleEng, setFormTitleEng] = useState("");
  const [formTitleBen, setFormTitleBen] = useState("");
  const [formDescEng, setFormDescEng] = useState("");
  const [formDescBen, setFormDescBen] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formVideoLink, setFormVideoLink] = useState("");
  const [formStatus, setFormStatus] = useState<Course["statusBadge"]>("Coming Soon");
  const [formThumbnail, setFormThumbnail] = useState("");

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("sudipta_academy_courses", JSON.stringify(courses));
    if (onCoursesChange) {
      onCoursesChange(courses);
    }
  }, [courses, onCoursesChange]);

  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormTitleEng("");
    setFormTitleBen("");
    setFormDescEng("");
    setFormDescBen("");
    setFormPrice(0);
    setFormVideoLink("");
    setFormStatus("Coming Soon");
    setFormThumbnail("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormTitleEng(course.titleEng);
    setFormTitleBen(course.titleBen);
    setFormDescEng(course.descriptionEng);
    setFormDescBen(course.descriptionBen);
    setFormPrice(course.price);
    setFormVideoLink(course.videoLink || "");
    setFormStatus(course.statusBadge);
    setFormThumbnail(course.thumbnailUrl || "");
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (!confirm(isBng ? `আপনি কি নিশ্চিতভাবে "${title}" কোর্সটি মুছে ফেলবেন?` : `Are you sure you want to delete the course "${title}"?`)) {
      return;
    }
    setCourses(prev => prev.filter(c => c.id !== id));
    triggerNotification(
      isBng ? "কোর্সটি সফলভাবে মুছে ফেলা হয়েছে!" : "Course deleted successfully!"
    );
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitleEng.trim() || !formTitleBen.trim()) {
      triggerNotification(
        isBng ? "ইংরেজি এবং বাংলা উভয় শিরোনাম প্রয়োজন!" : "Both English and Bengali titles are required!",
        "error"
      );
      return;
    }

    const courseData: Course = {
      id: editingCourse ? editingCourse.id : "course_" + Date.now(),
      titleEng: formTitleEng.trim(),
      titleBen: formTitleBen.trim(),
      descriptionEng: formDescEng.trim(),
      descriptionBen: formDescBen.trim(),
      price: Number(formPrice) || 0,
      videoLink: formVideoLink.trim() || undefined,
      statusBadge: formStatus,
      thumbnailUrl: formThumbnail.trim() || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"
    };

    if (editingCourse) {
      // Edit
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? courseData : c));
      triggerNotification(
        isBng ? "কোর্সটি সফলভাবে আপডেট করা হয়েছে!" : "Course updated successfully!"
      );
    } else {
      // Add
      setCourses(prev => [...prev, courseData]);
      triggerNotification(
        isBng ? "নতুন কোর্স সফলভাবে যোগ করা হয়েছে!" : "New course added successfully!"
      );
    }

    setIsModalOpen(false);
  };

  const handleSaveWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = localWhatsapp.replace(/[^\d]/g, "");
    if (!cleanNum || cleanNum.length < 10) {
      triggerNotification(
        isBng ? "দয়া করে একটি সঠিক হোয়াটসঅ্যাপ নম্বর লিখুন!" : "Please enter a valid WhatsApp number!",
        "error"
      );
      return;
    }
    if (onUpdateWhatsapp) {
      onUpdateWhatsapp(cleanNum);
    }
    localStorage.setItem("sudipta_academy_whatsapp", cleanNum);
    triggerNotification(
      isBng ? "হোয়াটসঅ্যাপ নম্বর সফলভাবে সেভ করা হয়েছে!" : "WhatsApp number saved successfully!"
    );
  };

  const filteredCourses = courses.filter(c => 
    c.titleEng.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.titleBen.includes(searchQuery)
  );

  return (
    <div id="admin-academy-courses" className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isBng ? "সুদীপ্ত ইভি একাডেমি কোর্স ম্যানেজার" : "Sudipta EV Academy Course Manager"}
                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  {courses.length} {isBng ? "টি কোর্স" : "Courses"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isBng 
                  ? "পাবলিক ইভি একাডেমি সেকশনের কোর্সের শিরোনাম, মূল্য, স্ট্যাটাস ব্যাজ এবং ভিডিও লিংক এখান থেকে পরিবর্তন করুন।" 
                  : "Manage the professional EV training course details, pre-book prices, YouTube/Drive preview links, and statuses."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isBng ? "নতুন কোর্স যোগ করুন" : "Add New Course"}</span>
        </button>
      </div>

      {/* Grid of config and course list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Configuration & WhatsApp Number Overrides (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* WhatsApp Direct Sync */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-emerald-500" />
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                {isBng ? "ইকোয়ারি হোয়াটসঅ্যাপ নম্বর" : "Inquiry WhatsApp Number"}
              </h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isBng 
                ? "গ্রাহকরা একাডেমি পেজে কোর্সের নিচে 'প্রি-বুক করুন' বাটনে চাপলে সরাসরি এই হোয়াটসঅ্যাপ নম্বরে মেসেজ পাঠাবে।" 
                : "When prospective students click 'Pre-Book via WhatsApp', they will be redirected to start a chat with this phone number."}
            </p>

            <form onSubmit={handleSaveWhatsapp} className="space-y-3 pt-1">
              <div>
                <input 
                  type="text" 
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. 919064517009"
                  value={localWhatsapp}
                  onChange={(e) => setLocalWhatsapp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isBng ? "নম্বর সেভ করুন" : "Save WhatsApp Number"}</span>
              </button>
            </form>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-slate-100 p-5 rounded-3xl border border-indigo-950 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs font-black uppercase text-indigo-300 tracking-widest">
                {isBng ? "একাডেমি স্ট্যাটিস্টিক্স" : "Academy Sync Stats"}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBng ? "মোট কোর্স" : "Total Courses"}</span>
                <span className="text-xl font-extrabold text-indigo-400">{courses.length}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBng ? "প্রি-বুক সক্রিয়" : "Active Pre-Books"}</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {courses.filter(c => c.statusBadge === "Pre-Book").length}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBng ? "প্রকাশিত / লাইভ ভিডিও" : "Published / Live Videos"}</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {courses.filter(c => c.statusBadge === "Active / Published").length} {isBng ? "টি লাইভ কোর্স" : "Active Courses Online"}
                </span>
              </div>
            </div>

            <div className="text-[9px] text-indigo-200 font-semibold uppercase tracking-wider flex items-center gap-1.5 pt-1">
              <Globe className="w-3.5 h-3.5 animate-spin" />
              <span>{isBng ? "লাইভ একাডেমি ফ্রন্টএন্ডের সাথে সরাসরি সিঙ্কড" : "DIRECTLY SYNCED WITH CLIENTS ACADEMY VIEW"}</span>
            </div>
          </div>

        </div>

        {/* Right Side: Courses List & Actions (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search bar */}
          <div className="relative bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={isBng ? "কোর্সের নাম বা কিওয়ার্ড লিখে খুঁজুন..." : "Search courses by title..."}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List layout */}
          {filteredCourses.length === 0 ? (
            <div className="p-16 bg-white border border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center shadow-sm">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
              <h5 className="text-xs font-bold text-slate-700">{isBng ? "কোনো কোর্স পাওয়া যায়নি" : "No Courses Configured"}</h5>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                {isBng 
                  ? "আপনার অনুসন্ধানের সাথে মেলে এমন কোনো কোর্স নেই। নতুন একটি কোর্স তৈরি করতে উপরে ডানদিকের বাটনে চাপুন।" 
                  : "No courses match your search query. Tap the Add New Course button to create training programs."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    {/* Course Banner Image Preview */}
                    <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                      <img 
                        src={course.thumbnailUrl || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} 
                        alt={course.titleEng} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                          course.statusBadge === "Active / Published" 
                            ? "bg-emerald-500 text-white border-emerald-400" 
                            : course.statusBadge === "Pre-Book"
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-amber-400 text-slate-900 border-amber-300"
                        }`}>
                          {isBng 
                            ? (course.statusBadge === "Active / Published" ? "সক্রিয় / লাইভ" : course.statusBadge === "Pre-Book" ? "প্রি-বুক" : "শীঘ্রই আসছে")
                            : course.statusBadge
                          }
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3.5">
                      <div className="space-y-1.5">
                        {/* Title Pairs */}
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1" title={course.titleEng}>
                          {course.titleEng}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400 font-sans line-clamp-1">
                          {course.titleBen}
                        </p>
                      </div>

                      {/* Brief description excerpt */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {isBng ? course.descriptionBen : course.descriptionEng}
                      </p>

                      {/* Metadata */}
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-slate-600">
                          <Coins className="w-3.5 h-3.5 text-indigo-500" />
                          <span>₹{(course.price || 0).toLocaleString("en-IN")}</span>
                        </span>
                        {course.videoLink && (
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 truncate max-w-[150px]">
                            <Play className="w-3 h-3 text-indigo-500 fill-indigo-500 shrink-0" />
                            <span className="truncate text-[10px] font-mono">{course.videoLink}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 hover:bg-slate-200 text-indigo-600 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isBng ? "সম্পাদনা" : "Edit"}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, isBng ? course.titleBen : course.titleEng)}
                      className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBng ? "মুছে ফেলুন" : "Delete"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Course Modal Form Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-150 flex flex-col relative animate-scale-up">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 text-slate-400 hover:text-slate-600 rounded-full p-1.5 bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h4 className="font-extrabold text-slate-850 text-sm">
                {editingCourse 
                  ? (isBng ? "কোর্স সংশোধন করুন" : "Edit Course Details") 
                  : (isBng ? "নতুন ইভি একাডেমি কোর্স যুক্ত করুন" : "Add New EV Academy Course")}
              </h4>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Language split titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Course Name (English) *
                  </label>
                  <input 
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., Lithium Battery Fabrication & Repairing"
                    value={formTitleEng}
                    onChange={(e) => setFormTitleEng(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    কোর্সের নাম (বাংলা) *
                  </label>
                  <input 
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none"
                    placeholder="যেমন: লিথিয়াম ব্যাটারি তৈরি ও মেরামত শিক্ষা"
                    value={formTitleBen}
                    onChange={(e) => setFormTitleBen(e.target.value)}
                  />
                </div>
              </div>

              {/* Price and status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Price (INR ₹) *
                  </label>
                  <input 
                    type="number"
                    required
                    min={0}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none font-mono"
                    placeholder="e.g., 3499"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Status Badge
                  </label>
                  <select
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Course["statusBadge"])}
                  >
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Pre-Book">Pre-Book</option>
                    <option value="Active / Published">Active / Published</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Description (English)
                </label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none h-20 resize-none"
                  placeholder="Summarize course content and goals..."
                  value={formDescEng}
                  onChange={(e) => setFormDescEng(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  কোর্স বিবরণী (বাংলা)
                </label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none h-20 resize-none"
                  placeholder="কোর্সের মূল বিষয়বস্তু ও উদ্দেশ্যগুলি লিখুন..."
                  value={formDescBen}
                  onChange={(e) => setFormDescBen(e.target.value)}
                />
              </div>

              {/* Video preview link and Thumbnail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Video Access Link (Google Drive / YouTube)
                  </label>
                  <input 
                    type="url"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none font-mono"
                    placeholder="https://youtube.com/... or Google Drive URL"
                    value={formVideoLink}
                    onChange={(e) => setFormVideoLink(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Banner / Thumbnail URL
                  </label>
                  <input 
                    type="url"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 focus:outline-none font-mono"
                    placeholder="https://images.unsplash.com/..."
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isBng ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {isBng ? "সংরক্ষণ করুন" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Alerts */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl max-w-sm transition-all duration-300 animate-slide-up ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

    </div>
  );
}
