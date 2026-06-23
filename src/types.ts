export interface Announcement {
  id: string;
  title: string;
  date: string;
  month: string;
  type: 'QUAN_TRỌNG' | 'THÔNG BÁO' | 'LỊCH THI';
  content: string;
}

export interface DocumentReq {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  iconName: string;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface StudentAdmissionForm {
  id: string;
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female' | '';
  nationalId: string;
  graduatedSchool: string;
  address: string;
  fatherName: string;
  motherName: string;
  phoneNumber: string;
  email: string;
  // Scores
  grade1Math: string;
  grade1Viet: string;
  grade2Math: string;
  grade2Viet: string;
  grade3Math: string;
  grade3Viet: string;
  grade3Eng: string;
  grade4Math: string;
  grade4Viet: string;
  grade4Eng: string;
  grade5Math: string;
  grade5Viet: string;
  grade5Eng: string;
  strengths: string;
  // Files
  birthCertFiles: DriveFile[];
  registrationFormFiles: DriveFile[];
  reportCardFiles: DriveFile[];
  status: 'DA_TIEP_NHAN' | 'DANG_KIEM_TRA' | 'BO_SUNG_HO_SO';
  submittedAt: string;
  adminNotes?: string;
}
