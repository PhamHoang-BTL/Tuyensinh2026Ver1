import { Announcement, DocumentReq, StudentAdmissionForm } from './types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Hướng dẫn chi tiết quy trình nộp hồ sơ trực tuyến năm 2026',
    date: '15/05/2026',
    month: '05',
    type: 'QUAN_TRỌNG',
    content: 'Để thuận tiện cho phụ huynh nộp hồ sơ, Nhà trường hướng dẫn cụ thể các thao tác trên cổng thông tin trực tuyến THCS Bắc Từ Liêm. Hệ thống sẽ chính thức mở nhận đăng ký từ ngày 01/07/2026 đến hết 17:00 ngày 03/07/2026. Phụ huynh cần chuẩn bị file scan hoặc ảnh chụp rõ nét của Giấy khai sinh, Học bạ tiểu học và Thông báo số định danh cá nhân.'
  },
  {
    id: 'ann-2',
    title: 'Danh sách các loại giấy tờ cần thiết trong hồ sơ tuyển sinh lớp 6',
    date: '10/05/2026',
    month: '05',
    type: 'THÔNG BÁO',
    content: 'Ban tuyển sinh Trường THCS Bắc Từ Liêm thông báo danh mục tài liệu bắt buộc bao gồm: 1. Đơn đăng kí dự tuyển (theo mẫu); 2. Bản sao giấy khai sinh hợp lệ (khi nộp cần mang kèm bản chính để đối chiếu); 3. Học bạ tiểu học bản gốc; 4. Xác nhận thông tin cư trú (hình ảnh trên VNEID, ...); 5. Giấy tờ ưu tiên khác (nếu có). Vui lòng đối chiếu kĩ thông tin trên hệ thống trước khi gửi.'
  }
];

export const GENERAL_GUIDELINES = [
  {
    step: 1,
    title: 'Kê khai thông tin',
    icon: 'edit_square',
    bg: 'bg-amber-500/10 text-amber-600',
    description: 'Điền đầy đủ thông tin cá nhân của học sinh, thông tin gia đình và lịch sử học tập. Kiểm tra kỹ các thông tin về giải thưởng hoặc thành tích đặc biệt (nếu có).'
  },
  {
    step: 2,
    title: 'Tải lên hồ sơ',
    icon: 'cloud_upload',
    bg: 'bg-emerald-500/10 text-emerald-600',
    description: 'Chụp ảnh hoặc scan các giấy tờ gốc theo yêu cầu (Giấy khai sinh, Học bạ, CCCD/Mã số định danh). Đảm bảo file hình ảnh rõ nét, không bị mất góc.'
  },
  {
    step: 3,
    title: 'Xác thực Google Drive',
    icon: 'cloud',
    bg: 'bg-red-500/10 text-red-600',
    description: 'Khi hệ thống yêu cầu xác thực Google, quý phụ huynh vui lòng bấm "Nâng cao" → "Đi tới TS2026 (không an toàn)" để cấp quyền lưu trữ hồ sơ lên Google Drive của nhà trường.'
  },
  {
    step: 4,
    title: 'Theo dõi kết quả',
    icon: 'event_note',
    bg: 'bg-indigo-500/10 text-indigo-600',
    description: 'Sau khi nhấn "Gửi hồ sơ", hệ thống sẽ gửi xác nhận qua SMS/Email. Phụ huynh có thể tra cứu trạng thái xét tuyển bất cứ lúc nào tại mục "Tra cứu". Lưu lại mã hồ sơ để theo dõi kết quả.'
  }
];

export const DOCUMENT_REQUIREMENTS: DocumentReq[] = [
  {
    id: 'doc-1',
    name: 'Giấy khai sinh',
    description: 'Bản sao hợp lệ từ sổ gốc hoặc bản sao có chứng thực từ bản chính.',
    tag: 'Bắt buộc',
    tagColor: 'text-amber-600 bg-amber-500/10 border-amber-200',
    iconName: 'baby'
  },
  {
    id: 'doc-2',
    name: 'Phiếu đăng kí dự tuyển',
    description: 'Phiếu đăng kí dự tuyển tuyển sinh theo mẫu của nhà trường (có chữ kí của phụ huynh).',
    tag: 'Bắt buộc',
    tagColor: 'text-amber-600 bg-amber-500/10 border-amber-200',
    iconName: 'badge'
  },
  {
    id: 'doc-3',
    name: 'Học bạ Tiểu học',
    description: 'Bản chính học bạ cấp Tiểu học hoặc các hồ sơ tương đương có kết quả lớp 5.',
    tag: 'Bản gốc',
    tagColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    iconName: 'book'
  }
];

export const INITIAL_STUDENT_PROFILE: StudentAdmissionForm = {
  id: 'BTL26-000001',
  fullName: 'Nguyễn Minh Anh',
  birthDate: '2015-10-12',
  gender: 'female',
  nationalId: '001150043924',
  graduatedSchool: 'Tiểu học Bắc Từ Liêm',
  address: 'TDP Trung 7, phường Tây Tựu, Thành phố Hà Nội',
  fatherName: 'Nguyễn Công Thắng',
  motherName: 'Lê Minh Hằng',
  phoneNumber: '0912345678',
  email: 'phuhuynh.minhanh@gmail.com',
  grade1Math: '8',
  grade1Viet: '9',
  grade2Math: '8',
  grade2Viet: '9',
  grade3Math: '9',
  grade3Viet: '8',
  grade3Eng: '9',
  grade4Math: '9',
  grade4Viet: '9',
  grade4Eng: '9',
  grade5Math: '10',
  grade5Viet: '9',
  grade5Eng: '10',
  strengths: 'Giải Nhì môn Toán cấp Quận lớp 4, Giải Ba Tiếng Anh cấp TP lớp 5',
  birthCertFiles: [{ id: 'sample-bc-1', name: 'giay_khai_sinh_minhanh.pdf' }],
  registrationFormFiles: [{ id: 'sample-rf-1', name: 'don_dang_ky_minhanh.pdf' }],
  reportCardFiles: [{ id: 'sample-rc-1', name: 'hoc_ba_tieu_hoc_minhanh.pdf' }],
  status: 'DA_TIEP_NHAN',
  submittedAt: '2026-05-15 14:32:00',
  adminNotes: 'Phụ huynh vui lòng theo dõi thông báo tiếp theo về lịch phỏng vấn năng khiếu vào ngày 20/05/2026 qua email cá nhân.'
};
