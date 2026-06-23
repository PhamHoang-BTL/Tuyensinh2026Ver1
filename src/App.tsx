import React, { useState, useEffect, useRef } from 'react';
import { 
  School, 
  BookOpen, 
  User, 
  Users, 
  Calendar, 
  Bell, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Search, 
  Menu, 
  X, 
  Info, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Upload,
  Check,
  Copy,
  UsersRound,
  CalendarDays,
  FileDown,
  Sparkles,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

import { Announcement, StudentAdmissionForm, DriveFile } from './types';
import { 
  INITIAL_ANNOUNCEMENTS, 
  GENERAL_GUIDELINES, 
  DOCUMENT_REQUIREMENTS, 
  INITIAL_STUDENT_PROFILE 
} from './data';
import {
  initGoogleDrive,
  requestDriveAccess,
  uploadFileToDrive,
  getDriveFileViewUrl,
  getDriveFileDownloadUrl,
  isGoogleDriveReady,
  createDriveFolder,
  appendToSheet,
} from './googleDrive';

export default function App() {
  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<'home' | 'guidelines' | 'register' | 'lookup'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAnn, setActiveAnn] = useState<Announcement | null>(null);
  
  // Lookup states
  const [lookupQuery, setLookupQuery] = useState('');
  const [checkedProfile, setCheckedProfile] = useState<StudentAdmissionForm | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Form states
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [nationalId, setNationalId] = useState('');
  const [graduatedSchool, setGraduatedSchool] = useState('');
  const [address, setAddress] = useState('');
  
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Score states
  const [g1Math, setG1Math] = useState('');
  const [g1Viet, setG1Viet] = useState('');
  const [g2Math, setG2Math] = useState('');
  const [g2Viet, setG2Viet] = useState('');
  const [g3Math, setG3Math] = useState('');
  const [g3Viet, setG3Viet] = useState('');
  const [g3Eng, setG3Eng] = useState('');
  const [g4Math, setG4Math] = useState('');
  const [g4Viet, setG4Viet] = useState('');
  const [g4Eng, setG4Eng] = useState('');
  const [g5Math, setG5Math] = useState('');
  const [g5Viet, setG5Viet] = useState('');
  const [g5Eng, setG5Eng] = useState('');

  // Strengths
  const [strengths, setStrengths] = useState('');

  // Form files state (stored as Google Drive file info)
  const [birthCertFiles, setBirthCertFiles] = useState<DriveFile[]>([]);
  const [regFormFiles, setRegFormFiles] = useState<DriveFile[]>([]);
  const [reportCardFiles, setReportCardFiles] = useState<DriveFile[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Raw selected files (before Drive upload)
  const [birthCertRaw, setBirthCertRaw] = useState<File[]>([]);
  const [regFormRaw, setRegFormRaw] = useState<File[]>([]);
  const [reportCardRaw, setReportCardRaw] = useState<File[]>([]);

  // Submission success state
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden file input refs
  const birthCertInputRef = useRef<HTMLInputElement>(null);
  const regFormInputRef = useRef<HTMLInputElement>(null);
  const reportCardInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Drive and seed localStorage
  useEffect(() => {
    initGoogleDrive().catch((err) => {
      console.warn('[Drive] Init deferred:', err.message);
    });
    const existingStr = localStorage.getItem('btl_admission_profiles');
    if (!existingStr) {
      localStorage.setItem('btl_admission_profiles', JSON.stringify([INITIAL_STUDENT_PROFILE]));
    }
  }, []);

  // Handle file selection (store raw file, upload happens at submit)
  const handleFileSelect = (type: 'birthCert' | 'regForm' | 'reportCard') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    if (type === 'birthCert') setBirthCertRaw(prev => [...prev, ...newFiles]);
    else if (type === 'regForm') setRegFormRaw(prev => [...prev, ...newFiles]);
    else if (type === 'reportCard') setReportCardRaw(prev => [...prev, ...newFiles]);
    triggerToast(`Đã chọn ${newFiles.length} tệp`);
    e.target.value = '';
  };

  const removeFile = (type: 'birthCert' | 'regForm' | 'reportCard', index: number) => {
    if (type === 'birthCert') setBirthCertRaw(prev => prev.filter((_, i) => i !== index));
    else if (type === 'regForm') setRegFormRaw(prev => prev.filter((_, i) => i !== index));
    else if (type === 'reportCard') setReportCardRaw(prev => prev.filter((_, i) => i !== index));
  };

  // Show dynamic system toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to lookup profiles locally
  const handleLookupSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(false);

    // Simulate small latency to make it feel super mechanical and high-fid
    setTimeout(() => {
      const existingStr = localStorage.getItem('btl_admission_profiles');
      const profiles: StudentAdmissionForm[] = existingStr ? JSON.parse(existingStr) : [INITIAL_STUDENT_PROFILE];
      
      const found = profiles.find(
        p => p.id.toLowerCase() === lookupQuery.trim().toLowerCase() ||
             p.fullName.toLowerCase().includes(lookupQuery.trim().toLowerCase())
      );

      setCheckedProfile(found || null);
      setIsSearching(false);
      setHasSearched(true);
    }, 600);
  };

  // Helper validation for steps
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Vui lòng điền họ và tên học sinh.';
    if (!birthDate) return 'Vui lòng cung cấp ngày sinh.';
    if (!gender) return 'Vui lòng chọn giới tính.';
    if (!nationalId.trim() || nationalId.length < 5) return 'Mã định danh học sinh / CCCD không hợp lệ.';
    if (!graduatedSchool.trim()) return 'Vui lòng cung cấp trường tiểu học đã tốt nghiệp.';
    if (!address.trim()) return 'Vui lòng điền địa chỉ thường trú.';
    return null;
  };

  const validateStep2 = () => {
    if (!fatherName.trim() && !motherName.trim()) return 'Vui lòng điền thông tin của ít nhất cha hoặc mẹ.';
    if (!phoneNumber.trim() || phoneNumber.length < 9) return 'Vui lòng nhập số điện thoại liên lạc hợp lệ.';
    if (!email.trim() || !email.includes('@')) return 'Vui lòng điền địa chỉ Email hợp lệ.';
    return null;
  };

  const nextStep = () => {
    if (formStep === 1) {
      const error = validateStep1();
      if (error) {
        triggerToast(error);
        return;
      }
      setFormStep(2);
    } else if (formStep === 2) {
      const error = validateStep2();
      if (error) {
        triggerToast(error);
        return;
      }
      setFormStep(3);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    if (formStep === 2) setFormStep(1);
    if (formStep === 3) setFormStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle final submission form
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep !== 3) return;

    // Validate files selected
    if (birthCertRaw.length === 0) {
      triggerToast('Vui lòng chọn ảnh chụp bản sao Giấy khai sinh.');
      return;
    }
    if (regFormRaw.length === 0) {
      triggerToast('Vui lòng chọn Phiếu đăng kí dự tuyển tuyển sinh.');
      return;
    }
    if (reportCardRaw.length === 0) {
      triggerToast('Vui lòng chọn file Học bạ lớp 5.');
      return;
    }
    if (!termsAccepted) {
      triggerToast('Bắt buộc đồng ý cam đoan thông tin chuẩn xác.');
      return;
    }

    try {
      // Auth first (before state updates, to keep popup gesture context)
      if (!isGoogleDriveReady()) {
        await initGoogleDrive();
        await requestDriveAccess();
      }

      // Generate random code BTL26-###### first
      const randCode = `BTL26-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

      setIsUploading(true);
      triggerToast('Đang tạo thư mục hồ sơ...');

      // Folder name with timestamp prefix for chronological sorting
      const folderId = await createDriveFolder(`${ts}_${randCode}`);

      triggerToast('Đang tải Giấy khai sinh...');
      const birthCertDrive = await Promise.all(birthCertRaw.map(f => uploadFileToDrive(f, folderId)));

      triggerToast('Đang tải Phiếu đăng kí dự tuyển...');
      const regFormDrive = await Promise.all(regFormRaw.map(f => uploadFileToDrive(f, folderId)));

      triggerToast('Đang tải Học bạ...');
      const reportCardDrive = await Promise.all(reportCardRaw.map(f => uploadFileToDrive(f, folderId)));
      const newProfile: StudentAdmissionForm = {
        id: randCode,
        fullName: fullName.trim(),
        birthDate,
        gender: gender as 'male' | 'female',
        nationalId: nationalId.trim(),
        graduatedSchool: graduatedSchool.trim(),
        address: address.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        grade1Math: g1Math,
        grade1Viet: g1Viet,
        grade2Math: g2Math,
        grade2Viet: g2Viet,
        grade3Math: g3Math,
        grade3Viet: g3Viet,
        grade3Eng: g3Eng,
        grade4Math: g4Math,
        grade4Viet: g4Viet,
        grade4Eng: g4Eng,
        grade5Math: g5Math,
        grade5Viet: g5Viet,
        grade5Eng: g5Eng,
        strengths: strengths.trim(),
        birthCertFiles: birthCertDrive,
        registrationFormFiles: regFormDrive,
        reportCardFiles: reportCardDrive,
        status: 'DANG_KIEM_TRA',
        submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        adminNotes: 'Hồ sơ đã được gửi trực tuyến thành công. Ban tuyển sinh trường THCS Bắc Từ Liêm đang tiến hành hậu kiểm dữ liệu.'
      };

      // Save to localStorage
      const existingStr = localStorage.getItem('btl_admission_profiles');
      const profiles: StudentAdmissionForm[] = existingStr ? JSON.parse(existingStr) : [INITIAL_STUDENT_PROFILE];
      profiles.unshift(newProfile);
      localStorage.setItem('btl_admission_profiles', JSON.stringify(profiles));

      // Save to Google Sheet (non-blocking)
      triggerToast('Đang lưu thông tin vào Google Sheet...');
      try {
        await appendToSheet([
          randCode,
          fullName.trim(),
          birthDate,
          gender === 'male' ? 'Nam' : 'Nữ',
          nationalId.trim(),
          graduatedSchool.trim(),
          address.trim(),
          fatherName.trim(),
          motherName.trim(),
          phoneNumber.trim(),
          email.trim(),
          g1Math, g1Viet, g2Math, g2Viet, g3Math, g3Viet, g3Eng, g4Math, g4Viet, g4Eng, g5Math, g5Viet, g5Eng,
          (() => { const v=[g1Math,g1Viet,g2Math,g2Viet,g3Math,g3Viet,g3Eng,g4Math,g4Viet,g4Eng,g5Math,g5Viet,g5Eng]; return v.reduce((s,x)=>s+(parseFloat(x)||0),0).toFixed(1); })(),
          strengths.trim(),
          birthCertDrive.map(f => `https://drive.google.com/file/d/${f.id}/view`).join('\n'),
          regFormDrive.map(f => `https://drive.google.com/file/d/${f.id}/view`).join('\n'),
          reportCardDrive.map(f => `https://drive.google.com/file/d/${f.id}/view`).join('\n'),
          'Đang kiểm tra',
          newProfile.submittedAt,
        ]);
      } catch (sheetErr: any) {
        console.error('Sheet error (non-blocking):', sheetErr);
        triggerToast('Lưu Sheet không thành công, nhưng hồ sơ vẫn được ghi nhận.');
      }

      // Show success dialog
      setSubmittedCode(randCode);
      setBirthCertFiles(birthCertDrive);
      setRegFormFiles(regFormDrive);
      setReportCardFiles(reportCardDrive);
      setShowSuccessModal(true);
      triggerToast('Nộp hồ sơ thành công!');
    } catch (err: any) {
      triggerToast(`Lỗi: ${err.message || 'Vui lòng thử lại'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Clean form state to original to allow quick submitting a fresh new one
  const resetFormState = () => {
    setFormStep(1);
    setFullName('');
    setBirthDate('');
    setGender('');
    setNationalId('');
    setGraduatedSchool('');
    setAddress('');
    setFatherName('');
    setMotherName('');
    setPhoneNumber('');
    setEmail('');
    setG1Math(''); setG1Viet(''); setG2Math(''); setG2Viet('');
    setG3Math(''); setG3Viet(''); setG3Eng('');
    setG4Math(''); setG4Viet(''); setG4Eng('');
    setG5Math(''); setG5Viet(''); setG5Eng('');
    setStrengths('');
    setBirthCertFiles([]);
    setRegFormFiles([]);
    setReportCardFiles([]);
    setBirthCertRaw([]);
    setRegFormRaw([]);
    setReportCardRaw([]);
    setTermsAccepted(false);
    setShowSuccessModal(false);
    setSubmittedCode(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('Đã sao chép mã số vào clipboard!');
  };

  // Fast direct switch tab handler
  const switchTab = (tab: 'home' | 'guidelines' | 'register' | 'lookup') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger hidden file input
  const triggerFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  // Helper to extract display name from DriveFile or string
  const getFileDisplayName = (file: DriveFile | string | null): string | null => {
    if (!file) return null;
    if (typeof file === 'object' && 'name' in file) return file.name;
    if (typeof file === 'string') return file;
    return null;
  };

  // Helper to get Google Drive view link
  const getFileViewLink = (file: DriveFile | string | null): string | null => {
    if (!file) return null;
    if (typeof file === 'object') {
      if ('webViewLink' in file && file.webViewLink) return file.webViewLink;
      if ('id' in file) return getDriveFileViewUrl(file.id);
    }
    return null;
  };

  const getFileDownloadLink = (file: DriveFile | string | null): string | null => {
    if (!file || typeof file !== 'object') return null;
    if ('id' in file) return getDriveFileDownloadUrl(file.id);
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] font-sans antialiased text-slate-800 relative select-none">
      
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700 animate-bounce">
          <Info className="text-amber-400 shrink-0 w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="fixed top-0 left-0 w-full z-40 h-16 bg-white border-b border-slate-100 shadow-[0_2px_15px_rgba(0,40,142,0.02)] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => switchTab('home')}>
          <div className="bg-primary p-2 rounded-lg text-white">
            <School className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold text-primary tracking-wide uppercase">TRƯỜNG THCS BẮC TỪ LIÊM</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider">CỔNG THÔNG TIN TUYỂN SINH</span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden md:flex items-center gap-1 font-medium">
          <button 
            onClick={() => switchTab('home')}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${currentTab === 'home' ? 'text-primary bg-primary/5 font-semibold' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
          >
            Trang chủ
          </button>
          <button 
            onClick={() => switchTab('guidelines')}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${currentTab === 'guidelines' ? 'text-primary bg-primary/5 font-semibold' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
          >
            Hướng dẫn
          </button>
          <button 
            onClick={() => switchTab('register')}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${currentTab === 'register' ? 'text-primary bg-primary/5 font-semibold' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
          >
            Đăng ký nộp hồ sơ
          </button>
          <button 
            onClick={() => switchTab('lookup')}
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${currentTab === 'lookup' ? 'text-primary bg-primary/5 font-semibold' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
          >
            Tra cứu kết quả
          </button>
        </nav>

        {/* Desktop Call To Action */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => switchTab('register')} 
            className="bg-primary hover:bg-primary-light active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md transition-all ease-in bg-gradient-to-r from-primary to-primary-light"
          >
            Nộp hồ sơ ngay
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2 text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-full p-4 flex flex-col gap-2 shadow-xl animate-slide-down" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => switchTab('home')}
              className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between ${currentTab === 'home' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600'}`}
            >
              <span>Trang chủ</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => switchTab('guidelines')}
              className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between ${currentTab === 'guidelines' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600'}`}
            >
              <span>Hướng dẫn & Quy trình</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => switchTab('register')}
              className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between ${currentTab === 'register' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600'}`}
            >
              <span>Đăng ký nộp hồ sơ</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => switchTab('lookup')}
              className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between ${currentTab === 'lookup' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600'}`}
            >
              <span>Tra cứu tuyển sinh</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => switchTab('register')}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
              >
                Nộp hồ sơ tuyển sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED DIRECTIVE VIEW MODAL */}
      {activeAnn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveAnn(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveAnn(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                activeAnn.type === 'QUAN_TRỌNG' ? 'bg-red-500/10 text-red-600' :
                activeAnn.type === 'THÔNG BÁO' ? 'bg-blue-500/10 text-blue-600' :
                'bg-amber-500/10 text-amber-600'
              }`}>
                {activeAnn.type}
              </span>
              <span className="text-xs text-slate-400 font-medium">{activeAnn.date}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{activeAnn.title}</h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
              {activeAnn.content}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl mt-6 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Ban Tuyển Sinh Bắc Từ Liêm hướng dẫn
              </h4>
              <p className="text-xs text-slate-500 leading-normal">
                Để ứng tuyển, Phụ huynh có thể nộp trực tuyến 100% bằng cách bấm sang thẻ "Đăng ký nộp hồ sơ", khai thông tin học sinh và thông tin gia đình rồi ấn nộp. Ban tuyển sinh tiếp nhận và phản hồi cập nhật trong vòng 2 đợt kiểm tra hồ sơ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CORE WRAP CONTENT VIEWPORT */}
      <main className="flex-grow pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto w-full transition-all duration-300">
        
        {/* -- SECTION 1: TRANG CHỦ (HOME VIEWS CO-ALIGNMENT WITH THE SECOND IMAGE) -- */}
        {currentTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* HERO SEGMENT WITH HIGH QUALITY SCHOOL IMAGE */}
            <section className="relative rounded-2xl filter overflow-hidden h-[330px] md:h-[430px] flex items-center shadow-lg bg-gradient-to-br from-primary via-primary-light to-blue-900 border border-slate-200">
              <div className="absolute inset-0 z-0">
                <img 
                  className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                  alt="THCS Bắc Từ Liêm School Campus"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbfZIQhqyO30NecYXhrDz6e6tly-6196lARN5_cbeRyCdPlevC-wMWdyV_-1rWFUTUKAIIZpeCOCckW0eY37ztjrLNCGM7goXMb11rRA-q4P_s1V7bb2rX8Fl7oBEz5aFNHsYpB_4VDS-QIxn5zh5F5zdCkpf1-XsHRVy69eFTe-RbMxfwgRchAMuMXqorJUycb_i55bbUe8POQn2tN4mGPPJMTuvCAU2_wpUoSS1mza_EvT6D8V_49eTh9Peuq1ABrdqvWM_xYll_"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-neutral-900/10"></div>
              </div>
              
              <div className="relative z-10 max-w-2xl px-6 md:px-12 text-white">
                <div className="inline-flex bg-accent text-slate-900 px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide items-center gap-1.5 shadow-sm uppercase">
                  <Sparkles className="w-3 h-3 fill-current" /> Niên khóa 2026 - 2027
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight drop-shadow-sm">
                  Tuyển sinh lớp 6<br />Năm học 2026-2027
                </h1>
                <p className="text-xs md:text-sm mb-6 text-slate-100 opacity-95 leading-relaxed font-medium">
                  Chào mừng Quý phụ huynh và Học sinh đến với cổng thông tin tuyển sinh trực tuyến chính thức của trường THCS Bắc Từ Liêm. Hệ thống hỗ trợ xử lý số hóa quy trình nộp hồ sơ, tinh giản thủ tục giấy tờ.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => switchTab('register')}
                    className="bg-accent hover:bg-amber-400 text-slate-900 text-xs md:text-sm font-extrabold px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Nộp hồ sơ ngay
                  </button>
                  <button 
                    onClick={() => switchTab('lookup')}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs md:text-sm font-bold px-6 py-3 rounded-xl active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Tra cứu hồ sơ
                  </button>
                </div>
              </div>
            </section>

            {/* KEY BENTO RATIO HIGHLIGHTS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QUOTA CARD */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-accent flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-primary rounded-full flex items-center justify-center shrink-0">
                  <UsersRound className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Chỉ tiêu tuyển sinh</span>
                  <p className="text-2xl font-black text-primary leading-tight mt-0.5">280 Học sinh</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 font-medium">* Áp dụng cho các lớp chất lượng cao, chia làm 8 lớp học đặc thù</p>
                </div>
              </div>

              {/* TIMELINE CARD */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 border-l-4 border-emerald-500 flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Thời gian nhận hồ sơ</span>
                   <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">01/07 — 03/07</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-1 font-medium">Năm học 2026 (Nhận song song trực tuyến và trực tiếp tại trường Đợt 1)</p>
                </div>
              </div>
            </section>

            {/* LATEST ANNOUNCEMENTS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Thông báo mới nhất từ Ban Tuyển Sinh
                </h3>
                <button 
                  onClick={() => switchTab('guidelines')} 
                  className="text-primary hover:text-primary-light font-bold text-xs flex items-center gap-1.5"
                >
                  Xem tất cả hướng dẫn <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {INITIAL_ANNOUNCEMENTS.map((ann) => (
                  <div 
                    key={ann.id}
                    onClick={() => setActiveAnn(ann)}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex gap-4 items-start"
                  >
                    <div className="min-w-[70px] h-16 bg-slate-50 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">THÁNG</span>
                      <span className="text-base font-black text-primary leading-none">{ann.month}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm md:text-base font-bold text-slate-900 leading-snug line-clamp-1 hover:text-primary mb-1">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          ann.type === 'QUAN_TRỌNG' ? 'bg-red-50 text-red-600' :
                          ann.type === 'THÔNG BÁO' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-500'
                        }`}>
                          {ann.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{ann.date}</span>
                      </div>
                    </div>
                    <div className="self-center hidden md:block">
                      <div className="p-2 text-slate-300 hover:text-primary rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PROGRESS STEPPER DIAGRAM */}
            <section className="bg-primary hover:bg-primary-dark text-white rounded-2xl p-6 md:p-8 transition-colors shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2">Quy trình nộp hồ sơ của chúng tôi</h3>
                <p className="text-xs text-slate-100 opacity-90 leading-relaxed font-light">
                  Phự huynh chỉ cần thực hiện 3 bước tiện lợi: Điền thông tin học sinh, nhập thông tin liên lạc của phụ huynh và đính kèm các tài liệu scan cần thiết.
                </p>
              </div>

              {/* Horizontal / Vertical mini Roadmap stepper */}
              <div className="w-full md:w-auto shrink-0 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="font-bold text-xs md:text-sm">Đăng ký tài khoản & khai báo thông tin</p>
                    <p className="text-[10px] opacity-75">Tạo hồ sơ đầu vào cho học sinh dễ dàng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 text-white font-extrabold text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="font-bold text-xs md:text-sm">Đính kèm minh chứng photo scan</p>
                    <p className="text-[10px] opacity-75">Đính kèm học bạ lớp 5 và giấy khai sinh bản chụp</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 text-white font-extrabold text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="font-bold text-xs md:text-sm">Nộp thành công & Tra cứu kết quả</p>
                    <p className="text-[10px] opacity-75">Sử dụng mã số được cấp để giám sát cập nhật</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -- SECTION 2: HƯỚNG DẪN CHI TIẾT (THE FIRST IMAGE DETAILED TIMELINE) -- */}
        {currentTab === 'guidelines' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* HERO INTRODUCTION */}
            <div className="bg-blue-50/70 border border-blue-100/50 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Hướng dẫn Quy trình Tuyển sinh</h2>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                  Chào mừng phụ huynh và học sinh đến với cổng bản đồ tuyển sinh trực tuyến Trường THCS Bắc Từ Liêm. Quý phụ huynh vui lòng đọc kỹ hướng dẫn 4 bước dưới đây để kê khai và nộp học bạ đúng quy định.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-5">
                  <a href="#quy-trinh" className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <ClipboardCheck className="w-4 h-4" /> Xem quy trình
                  </a>
                  <a href="#ho-so-can-thiet" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Hồ sơ cần thiết
                  </a>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-1/6 translate-y-1/6 text-blue-900/5 select-none pointer-events-none hidden md:block">
                <School className="w-60 h-60" />
              </div>
            </div>

            {/* ROADMAP SECTION (STEP 1 - 4) */}
            <section id="quy-trinh" className="py-2">
              <div className="text-center mb-6">
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">Lộ trình 4 bước</span>
                <h3 className="text-xl font-bold mt-2">Quy trình thực hiện</h3>
              </div>

              {/* TIMELINE LIST */}
              <div className="relative step-line pl-0 max-w-3xl mx-auto">
                {GENERAL_GUIDELINES.map((step) => (
                  <div key={step.step} className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-10 relative">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold text-sm flex items-center justify-center z-10 shrink-0 shadow-md">
                      {step.step}
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.015)] hover:border-slate-200 transition-all flex-1">
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className={`p-2 rounded-xl text-primary font-bold bg-primary/5`}>
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-bold text-sm md:text-base text-slate-900">{step.title}</h4>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* REQUIRED BENTO DOCUMENTS GRID */}
            <section id="ho-so-can-thiet" className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Hồ sơ đăng ký yêu cầu</h3>
                <p className="text-xs text-slate-500 mt-1">Quý phụ huynh vui lòng scan hoặc chụp ảnh rõ nét bản chính các loại giấy tờ dưới đây:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DOCUMENT_REQUIREMENTS.map((doc) => (
                  <div key={doc.id} className="border border-slate-100 rounded-2xl p-5 relative flex flex-col gap-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-slate-200/80 transition-all">
                    <div className="p-3 w-11 h-11 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm md:text-sm mb-1.5">{doc.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-100/10 flex items-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        doc.tag === 'Bắt buộc' ? 'bg-red-50 text-red-600 border border-red-200' :
                        doc.tag === 'Bản gốc' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}>
                        {doc.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MOCK FILES DOWNLOAD SEGMENT */}
            <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between border border-slate-800 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-accent" /> Hồ sơ tài liệu chi tiết tuyển sinh
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tải về bản chụp văn bản hành chính, quy chế thi Chất Lượng Cao, và các biểu mẫu học sinh. Đọc kĩ trước khi làm hồ sơ.
                </p>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col gap-2.5">
                <button 
                  onClick={() => triggerToast('Đang mô tả tải về file Quy chế tuyển sinh 2026.pdf ...')}
                  className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4 w-full md:w-80 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded text-white font-extrabold text-[10px]">PDF</div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-normal line-clamp-1">Quy chế tuyển sinh 2026.pdf</p>
                      <span className="text-[10px] text-slate-400">PDF • 2.4 MB</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-300 opacity-80" />
                </button>

                <button 
                  onClick={() => triggerToast('Đang mô tả tải về file Mẫu đơn xin nhập học.pdf ...')}
                  className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4 w-full md:w-80 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded text-white font-extrabold text-[10px]">PDF</div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-normal line-clamp-1">Mẫu đơn xin nhập học.pdf</p>
                      <span className="text-[10px] text-slate-400">PDF • 1.1 MB</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-300 opacity-80" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* -- SECTION 3: ĐĂNG KÝ NỘP HỒ SƠ MULTI-STEP ADMISSION FORM -- */}
        {currentTab === 'register' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            
            {/* PROGRESS STEPPER HEADER */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 relative">
                {/* Connector line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-0 -translate-y-1/2"></div>
                
                {/* Dynamically colored active track line */}
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 -z-0"
                  style={{ width: formStep === 1 ? '0%' : formStep === 2 ? '50%' : '100%' }}
                ></div>

                {/* Steps indic */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    formStep >= 1 ? 'bg-primary text-white scale-110 shadow' : 'bg-slate-150 text-slate-400'
                  }`}>
                    {formStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${formStep >= 1 ? 'text-primary' : 'text-slate-400'}`}>Học sinh</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    formStep >= 2 ? 'bg-primary text-white scale-110 shadow' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {formStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${formStep >= 2 ? 'text-primary' : 'text-slate-400'}`}>Phụ huynh</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    formStep === 3 ? 'bg-primary text-white scale-110 shadow' : 'bg-slate-100 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${formStep === 3 ? 'text-primary' : 'text-slate-400'}`}>Tải hồ sơ</span>
                </div>
              </div>

              <h2 className="text-base md:text-xl font-bold text-primary text-center">Nộp Hồ Sơ Đăng Ký Nhập Học Lớp 6</h2>
              <p className="text-xs text-slate-500 text-center mt-1">Phụ huynh vui lòng chuẩn bị học bạ của cháu và điền dữ liệu tuần tự chuẩn xác.</p>
            </div>

            {/* MAIN FORM BOX CONTAINER */}
            <form onSubmit={handleAdmissionSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              
              {/* STEP 1: STUDENT DATA */}
              {formStep === 1 && (
                <div className="p-6 md:p-8 space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <User className="text-primary w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-sm md:text-base text-slate-900">Thông Tin Học Sinh</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Họ và tên học sinh <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="Nộp hồ sơ cho học sinh ví dụ: Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {/* Birthdate */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Ngày tháng năm sinh <span className="text-red-500">*</span></label>
                      <input 
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Giới tính <span className="text-red-500">*</span></label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>

                    {/* Student National ID/CCCD */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Số định danh cá nhân / Mã HS <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="12 số định danh cá nhân ghi trên khai sinh"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {/* Primary school of graduation */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700">Trường tiểu học đã tốt nghiệp <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        placeholder="Ví dụ: Trường tiểu học Bắc Từ Liêm, Quận Bắc Từ Liêm"
                        value={graduatedSchool}
                        onChange={(e) => setGraduatedSchool(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {/* Permanent Address */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700">Địa chỉ thường trú của học sinh <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={2}
                        placeholder="Số nhà, ngõ ngách, tổ dân phố, phường, quận..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* SCORES SECTION */}
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2 pt-2">
                    <span className="text-primary text-lg font-bold shrink-0">📊</span>
                    <h3 className="font-bold text-sm md:text-base text-slate-900">Bảng Điểm Tiểu Học</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-200 p-2 text-left font-bold text-slate-700">Môn</th>
                          <th className="border border-slate-200 p-2 text-center font-bold text-slate-700">Lớp 1</th>
                          <th className="border border-slate-200 p-2 text-center font-bold text-slate-700">Lớp 2</th>
                          <th className="border border-slate-200 p-2 text-center font-bold text-slate-700">Lớp 3</th>
                          <th className="border border-slate-200 p-2 text-center font-bold text-slate-700">Lớp 4</th>
                          <th className="border border-slate-200 p-2 text-center font-bold text-slate-700">Lớp 5</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 p-2 font-medium text-slate-700">Toán</td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g1Math} onChange={e => setG1Math(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g2Math} onChange={e => setG2Math(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g3Math} onChange={e => setG3Math(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g4Math} onChange={e => setG4Math(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g5Math} onChange={e => setG5Math(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 p-2 font-medium text-slate-700">Tiếng Việt</td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g1Viet} onChange={e => setG1Viet(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g2Viet} onChange={e => setG2Viet(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g3Viet} onChange={e => setG3Viet(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g4Viet} onChange={e => setG4Viet(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g5Viet} onChange={e => setG5Viet(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                        </tr>
                        <tr>
                          <td className="border border-slate-200 p-2 font-medium text-slate-700">Tiếng Anh</td>
                          <td className="border border-slate-200 p-2 text-center text-slate-400 text-[10px]">—</td>
                          <td className="border border-slate-200 p-2 text-center text-slate-400 text-[10px]">—</td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g3Eng} onChange={e => setG3Eng(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g4Eng} onChange={e => setG4Eng(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                          <td className="border border-slate-200 p-2"><input type="number" min="0" max="10" step="0.5" value={g5Eng} onChange={e => setG5Eng(e.target.value)} className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Điểm mạnh của con (năng khiếu, các giải cấp Quận, TP trở lên,...)</label>
                    <textarea
                      rows={3}
                      value={strengths}
                      onChange={e => setStrengths(e.target.value)}
                      placeholder="Ví dụ: Giải Nhì môn Toán cấp Quận lớp 4, Giải Ba Tiếng Anh cấp Thành phố lớp 5, Năng khiếu vẽ..."
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-primary hover:bg-primary-light text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-1 shadow cursor-pointer"
                    >
                      Tiếp tục bước 2 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PARENT CONTACT DATA */}
              {formStep === 2 && (
                <div className="p-6 md:p-8 space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Users className="text-primary w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-sm md:text-base text-slate-900">Thông Tin Phụ Huynh / Người Giám Hộ</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Father name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Họ và tên Cha</label>
                      <input 
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn Hải"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Mother name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Họ và tên Mẹ</label>
                      <input 
                        type="text"
                        placeholder="Ví dụ: Lê Thị Hoa"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Hotline Phone */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Số điện thoại liên lạc liên hệ <span className="text-red-500">*</span></label>
                      <input 
                        type="tel"
                        placeholder="Ví dụ: 0912xxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {/* Parent Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Email nhận kết quả xét tuyển <span className="text-red-500">*</span></label>
                      <input 
                        type="email"
                        placeholder="Ví dụ: phuhuynh@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100 text-xs">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-full flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Quay lại bước 1
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-2.5 rounded-full flex items-center gap-1 shadow cursor-pointer"
                    >
                      Tiếp tục bước 3 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SPECIFIC DOCUMENTS UPLOADS */}
              {formStep === 3 && (
                <div className="p-6 md:p-8 space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Upload className="text-primary w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-sm md:text-base text-slate-900">Tải Lên Hồ Sơ Đính Kèm Minh Chứng</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Panel 1: Birth Cert */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">
                            Bản sao Giấy khai sinh hợp lệ <span className="text-red-500">*</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Yêu cầu định dạng: PDF, JPG, PNG (Tép nhỏ hơn 5MB)</p>
                          {birthCertRaw.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {birthCertRaw.map((f, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                  {f.name} <button type="button" onClick={() => removeFile('birthCert', i)} className="text-red-500 hover:text-red-700 ml-0.5 font-bold cursor-pointer">&times;</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" ref={birthCertInputRef} onChange={handleFileSelect('birthCert')} className="hidden" />
                      <button type="button" disabled={isUploading} onClick={() => triggerFileInput(birthCertInputRef)}
                        className={`text-xs px-4 py-2 font-bold rounded-xl transition-all cursor-pointer shrink-0 ${isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : birthCertRaw.length > 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-primary hover:bg-primary-light text-white'}`}
                      >{isUploading ? 'Đang tải...' : birthCertRaw.length > 0 ? 'Thêm tệp' : 'Chọn tệp đính kèm'}</button>
                    </div>

                    {/* Panel 2: Registration Form */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">
                            Phiếu đăng kí dự tuyển tuyển sinh <span className="text-red-500">*</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Phiếu đăng kí dự tuyển theo mẫu của nhà trường, có chữ kí của phụ huynh</p>
                          {regFormRaw.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {regFormRaw.map((f, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                  {f.name} <button type="button" onClick={() => removeFile('regForm', i)} className="text-red-500 hover:text-red-700 ml-0.5 font-bold cursor-pointer">&times;</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" ref={regFormInputRef} onChange={handleFileSelect('regForm')} className="hidden" />
                      <button type="button" disabled={isUploading} onClick={() => triggerFileInput(regFormInputRef)}
                        className={`text-xs px-4 py-2 font-bold rounded-xl transition-all cursor-pointer shrink-0 ${isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : regFormRaw.length > 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-primary hover:bg-primary-light text-white'}`}
                      >{isUploading ? 'Đang tải...' : regFormRaw.length > 0 ? 'Thêm tệp' : 'Chọn tệp đính kèm'}</button>
                    </div>

                    {/* Panel 3: Primary Report Card */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0 mt-0.5">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">
                            Học bạ Tiểu học gốc (quyết định lớp 5) <span className="text-red-500">*</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Scan toàn bộ học bạ hoặc thư xác nhận kết quả học tập tiểu học</p>
                          {reportCardRaw.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {reportCardRaw.map((f, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                  {f.name} <button type="button" onClick={() => removeFile('reportCard', i)} className="text-red-500 hover:text-red-700 ml-0.5 font-bold cursor-pointer">&times;</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" ref={reportCardInputRef} onChange={handleFileSelect('reportCard')} className="hidden" />
                      <button type="button" disabled={isUploading} onClick={() => triggerFileInput(reportCardInputRef)}
                        className={`text-xs px-4 py-2 font-bold rounded-xl transition-all cursor-pointer shrink-0 ${isUploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : reportCardRaw.length > 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-primary hover:bg-primary-light text-white'}`}
                      >{isUploading ? 'Đang tải...' : reportCardRaw.length > 0 ? 'Thêm tệp' : 'Chọn tệp đính kèm'}</button>
                    </div>
                  </div>

                  {/* Declaration terms and verification check */}
                  <div className="bg-amber-500/5 hover:bg-amber-500/10 transition-colors rounded-xl p-4 border border-amber-500/20 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4.5 h-4.5 text-primary bg-slate-100 rounded border-slate-300 focus:ring-primary focus:ring-1"
                        required
                      />
                      <span className="text-slate-600 leading-normal font-medium">
                        Tôi cam đoan mọi thông tin kê khai trên là hoàn toàn chính xác thực tế, các tệp scan đính kèm là tài liệu gốc và tự chịu trách nhiệm hoàn toàn trước pháp luật của nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam học kỳ này.
                      </span>
                    </label>
                  </div>

                  <div className="bg-red-500/5 border border-red-300/40 rounded-xl p-3 text-[11px] text-red-700 font-medium leading-relaxed">
                    <span className="font-bold uppercase">Lưu ý:</span> Khi hệ thống yêu cầu xác thực Google, quý phụ huynh vui lòng bấm <span className="font-bold">'Nâng cao'</span> → <span className="font-bold">'Đi tới... (không an toàn)'</span> để tiếp tục. Đây là bước bảo mật cần thiết để tải hồ sơ lên Google Drive của nhà trường.
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs font-bold">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      disabled={isUploading}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-full flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Quay lại bước 2
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isUploading}
                      className={`px-10 py-3 rounded-full flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm cursor-pointer ${isUploading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                      <CheckCircle className="w-4 h-4" /> {isUploading ? 'Đang tải lên Google Drive...' : 'Xác nhận nộp hồ sơ ngay'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* SIDE ADVICE NOTE */}
            <div className="bg-amber-500/5 rounded-2xl p-5 border-l-4 border-accent text-xs md:text-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Info className="w-4.5 h-4.5 text-accent-dark" /> Lưu ý quan trọng tuyển sinh THCS Bắc Từ Liêm
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
                <li>Mã số hồ sơ cá nhân sẽ được cấp ngay sau khi phụ huynh hoàn thiện form nộp thành công ở bước 3.</li>
                <li>Vui lòng sao chép lại mã số này để sử dụng tra cứu trong suốt tiến trình xem kết quả đính kèm sau này.</li>
                <li>Hệ thống máy chủ trực tuyến sẽ tự động tắt và ngắt tiếp nhận form đúng 18:00 ngày 03/07/2026. Phụ huynh nên nộp sớm.</li>
              </ul>
            </div>
          </div>
        )}

        {/* -- SECTION 4: TRA CỨU HỒ SƠ TUYỂN SINH (CONFORMS TO THIRD SCREEN AS SHOWN) -- */}
        {currentTab === 'lookup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            
            {/* SEARCH FORUM CARD */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-black text-primary leading-tight">Tra cứu kết quả tuyển sinh</h2>
                <p className="text-xs text-slate-500 mt-1">Phụ huynh nhập chính xác mã hồ sơ được cấp (Ví dụ: <strong>BTL26-000001</strong>) để xem kết quả.</p>
              </div>

              <form onSubmit={handleLookupSearch} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Mã hồ sơ học sinh</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input 
                      type="text" 
                      placeholder="Nhập mã hồ sơ ví dụ: BTL26-000001 hoặc tên học sinh..."
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light active:scale-95 text-white py-3.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" /> Tra cứu hồ sơ tuyển sinh
                </button>
              </form>
            </div>

            {/* LOADER SPINNER INTERACTION */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-4 font-semibold tracking-wider">Đang kiểm tra dữ liệu kết quả...</p>
              </div>
            )}

            {/* RESULTS VIEW */}
            {hasSearched && !isSearching && (
              <div>
                {checkedProfile ? (
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden animate-in slide-in-from-bottom-3 duration-250">
                    {/* Header lookup */}
                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="text-xs text-slate-600 font-bold">
                          Kết quả tìm kiếm cho mã: <strong className="text-primary">{checkedProfile.id}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Trực tuyến</span>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                      {/* Identity Card */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 leading-normal">{checkedProfile.fullName}</h3>
                          <p className="text-xs text-slate-500 mt-1">Ngày sinh: {checkedProfile.birthDate ? new Date(checkedProfile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                          <p className="text-xs text-slate-500 leading-normal mt-0.5">Trường cấp 1 tốt nghiệp: {checkedProfile.graduatedSchool}</p>
                          <p className="text-xs text-slate-500 leading-normal mt-0.5">Địa chỉ nhà: {checkedProfile.address}</p>
                        </div>
                      </div>

                      {/* Line divider */}
                      <hr className="border-slate-100" />

                      {/* Status pill segment */}
                      <div className={`border-l-4 ${
                        checkedProfile.status === 'DA_TIEP_NHAN' ? 'border-emerald-600 bg-emerald-500/5' :
                        checkedProfile.status === 'DANG_KIEM_TRA' ? 'border-amber-500 bg-amber-500/5' :
                        'border-red-500 bg-red-500/5'
                      } px-4 py-3 rounded-r-xl`}>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                            checkedProfile.status === 'DA_TIEP_NHAN' ? 'bg-emerald-50 text-emerald-800' :
                            checkedProfile.status === 'DANG_KIEM_TRA' ? 'bg-amber-50 text-amber-800' :
                            'bg-red-50 text-red-800'
                          }`}>
                            {checkedProfile.status === 'DA_TIEP_NHAN' ? 'Đã tiếp nhận' :
                             checkedProfile.status === 'DANG_KIEM_TRA' ? 'Đang kiểm tra' :
                             'Yêu cầu bổ sung'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{checkedProfile.submittedAt}</span>
                        </div>
                        <h4 className="font-extrabold text-xs md:text-sm text-slate-900">
                          {checkedProfile.status === 'DA_TIEP_NHAN' ? 'Hồ sơ đã được tiếp nhận thành công' :
                           checkedProfile.status === 'DANG_KIEM_TRA' ? 'Hồ sơ tuyển sinh trực tuyến đang được thẩm định' :
                           'Vui lòng đính kèm bổ sung minh chứng'}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-2">
                          Tài liệu đính kèm hồ sơ:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {checkedProfile.birthCertFiles && checkedProfile.birthCertFiles.length > 0 && checkedProfile.birthCertFiles.map((f, i) => (
                            <a key={i} href={getDriveFileDownloadUrl(f.id) || '#'} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> Giấy khai sinh {i + 1}
                            </a>
                          ))}
                          {checkedProfile.registrationFormFiles && checkedProfile.registrationFormFiles.length > 0 && checkedProfile.registrationFormFiles.map((f, i) => (
                            <a key={i} href={getDriveFileDownloadUrl(f.id) || '#'} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> Phiếu ĐKDT {i + 1}
                            </a>
                          ))}
                          {checkedProfile.reportCardFiles && checkedProfile.reportCardFiles.length > 0 && checkedProfile.reportCardFiles.map((f, i) => (
                            <a key={i} href={getDriveFileDownloadUrl(f.id) || '#'} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                              <BookOpen className="w-3.5 h-3.5" /> Học bạ {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Admin Remarks notes */}
                      {checkedProfile.adminNotes && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 relative">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Cơ quan xem xét phê duyêt</span>
                          <p className="text-xs text-slate-600 italic font-medium">"{checkedProfile.adminNotes}"</p>
                        </div>
                      )}

                      {/* Action response */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs font-bold">
                        <button 
                          onClick={() => triggerToast('Đang tạo file PDF xác minh phiếu tuyển sinh...')}
                          className="flex-1 bg-primary hover:bg-primary-light text-white rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Download className="w-4 h-4" /> Tải phiếu đăng ký bản PDF
                        </button>
                        <button 
                          disabled 
                          className="flex-1 bg-slate-100 text-slate-400 rounded-xl p-3 flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <ClipboardCheck className="w-4 h-4" /> Bản nháp chỉnh sửa (đã khóa)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm space-y-3">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900">Không tìm thấy mã hồ sơ tuyển sinh</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Xin lỗi, mã số hồ sơ "<strong>{lookupQuery}</strong>" không khớp với bất kỳ thông tin nào hiện có trong bộ cơ sở dữ liệu học sinh niên khóa 2026-2027 của trường.
                    </p>
                    <p className="text-[11px] text-slate-400 italic">Mẹo: Thử tìm theo mẫu tuyển sinh mặc định của hệ thống: <strong>BTL26-000001</strong> hoặc đăng ký mới hoàn chỉnh.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-100 py-10 px-4 md:px-8 mt-12 text-slate-500 text-xs shadow-inner">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-between">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary p-1.5 rounded text-white shrink-0">
                <School className="w-4 h-4" />
              </div>
              <span className="font-black text-sm text-primary uppercase">TRƯỜNG THCS BẮC TỪ LIÊM</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400">
              Cổng thông tin tuyển sinh trực tuyến thuộc quản lý của Ban giám hiệu trường THCS Bắc Từ Liêm. Hệ thống tự động đồng bộ hồ sơ tuyển sinh đúng chuẩn số hóa ngành giáo dục năm học 2026-2027.
            </p>
            <p className="font-semibold text-slate-400">© 2026 Trường THCS Bắc Từ Liêm. Tất cả bản quyền được bảo hộ.</p>
          </div>

          <div className="flex flex-col gap-2 font-medium text-[11px] text-slate-500 md:items-end md:justify-end md:text-right">
            <div className="flex items-center gap-1.5 justify-start md:justify-end">
              <MapPin className="w-3.5 h-3.5 text-primary" />
               <span>Địa chỉ: TDP Trung 7, phường Tây Tựu, Thành phố Hà Nội</span>
            </div>
            <div className="flex items-center gap-1.5 justify-start md:justify-end">
              <Phone className="w-3.5 h-3.5 text-primary" />
               <span>Hotline: 098.631.6991</span>
            </div>
            <div className="flex items-center gap-1.5 justify-start md:justify-end">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email: tuyensinh.thcsbactuliem@gmail.com</span>
            </div>
          </div>
          
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR BAR (CO-ALIGNED TO FOOTER BAR OF ATTACHMENTS) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white border-t border-slate-100/80 px-2 py-2 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.035)] backdrop-blur-md">
        <button 
          onClick={() => switchTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <School className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Trang chủ</span>
        </button>

        <button 
          onClick={() => switchTab('guidelines')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'guidelines' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Hướng dẫn</span>
        </button>

        <button 
          onClick={() => switchTab('register')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'register' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Đăng ký</span>
        </button>

        <button 
          onClick={() => switchTab('lookup')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            currentTab === 'lookup' ? 'text-primary bg-primary/5 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Tra cứu</span>
        </button>
      </nav>

      {/* FLOAT ACTION BUTTON IN LIGHT CONTEXT */}
      <div className="fixed bottom-20 right-4 md:right-8 z-30 select-none">
        <button 
          onClick={() => switchTab('register')}
          className="w-12 h-12 bg-accent shadow-lg text-slate-900 rounded-full flex items-center justify-center hover:bg-amber-400 hover:shadow-xl active:scale-95 transition-all outline-none"
          title="Nộp hồ sơ ngay"
        >
          <ClipboardCheck className="w-5 h-5 text-slate-950" />
        </button>
      </div>

      {/* REGISTRATION SUCCESS DIALOG MODAL LAYOUT */}
      {showSuccessModal && submittedCode && (
        <div className="fixed inset-0 bg-slate-905/70 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative select-none animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Check className="w-8 h-8 font-black" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-1">Nộp Hồ Sơ Thành Công!</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Mã số hồ sơ cá nhân tuyển sinh lớp 6 THCS Bắc Từ Liêm của học sinh <strong>{fullName}</strong> đã được lưu trữ trên Tổng đài.
            </p>

            {/* Generated Code Area */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex items-center justify-between gap-4 mb-5">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Mã Hồ Sơ Tra Cứu</span>
                <p className="text-lg font-black text-primary leading-tight">{submittedCode}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(submittedCode)}
                className="bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-6 font-medium">
              * Phụ huynh có thể sử dụng ngay mã số này tại thẻ <strong>"Tra cứu"</strong> ở thanh định vị trên để theo dõi sát cập nhật kiểm tra của Ban Tuyển Sinh Bắc Từ Liêm. Đã gửi Email xác minh của bạn.
            </p>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setLookupQuery(submittedCode);
                  switchTab('lookup');
                  setShowSuccessModal(false);
                  setTimeout(() => handleLookupSearch(), 100);
                }}
                className="flex-1 bg-primary hover:bg-primary-light text-white font-bold text-xs py-3 rounded-xl shadow cursor-pointer transition-all"
              >
                Tra cứu hồ sơ này ngay
              </button>
              <button 
                onClick={resetFormState}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
