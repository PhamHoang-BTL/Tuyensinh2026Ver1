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
  birthCertFile: DriveFile | string | null;
  registrationFormFile: DriveFile | string | null;
  reportCardFile: DriveFile | string | null;
  status: 'DA_TIEP_NHAN' | 'DANG_KIEM_TRA' | 'BO_SUNG_HO_SO';
  submittedAt: string;
  adminNotes?: string;
}
