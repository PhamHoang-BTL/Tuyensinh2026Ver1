import { Announcement, DocumentReq, StudentAdmissionForm } from './types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Hướng dẫn chi tiết quy trình nộp hồ sơ trực tuyến năm 2026',
    date: '15/05/2026',
    month: '05',
    type: 'QUAN_TRỌNG',
    content: 'Để thuận tiện cho phụ huynh nộp hồ sơ, Nhà trường hướng dẫn cụ thể các thao tác trên cổng thông tin trực tuyến THCS Bắc Từ Liêm. Hệ thống sẽ chính thức mở nhận đăng ký từ ngày 20/06/2026 đến hết 17:00 ngày 01/07/2026. Phụ huynh cần chuẩn bị file scan hoặc ảnh chụp rõ nét của Giấy khai sinh, Học bạ tiểu học và Thông báo số định danh cá nhân.'
  },
  {
    id: 'ann-2',
    title: 'Danh sách các loại giấy tờ cần thiết trong hồ sơ tuyển sinh lớp 6',
    date: '10/05/2026',
    month: '05',
    type: 'THÔNG BÁO',
    content: 'Ban tuyển sinh Trường THCS Bắc Từ Liêm thông báo danh mục tài liệu bắt buộc bao gồm: 1. Bản sao khai sinh hợp lệ; 2. Học bạ tiểu học bản gốc (hoặc xác nhận hoàn thành chương trình tương đương); 3. Giấy xác nhận thông tin về cư trú (mẫu CT07) hoặc thông báo mã số định danh học sinh. Vui lòng đối chiếu kỹ thông tin trên hệ thống trước khi gửi.'
  },
  {
    id: 'ann-3',
    title: 'Kế hoạch khảo sát năng lực đầu vào đợt 1 năm học 2026-2027',
    date: '28/04/2026',
    month: '04',
    type: 'LỊCH THI',
    content: 'Trường THCS Bắc Từ Liêm tổ chức khảo sát năng lực đầu vào đối với học sinh đăng ký xét tuyển lớp Chất lượng cao. Đợt 1 kiểm tra 3 môn Toán, Tiếng Việt và Tiếng Anh dự kiến diễn ra vào sáng ngày 15/06/2026. Danh sách phòng thi và số báo danh của học sinh sẽ được công bố trước ngày 10/06/2026 trực tiếp trên cổng tra cứu của trường.'
  }
];

export const GENERAL_GUIDELINES = [
  {
    step: 1,
    title: 'Tạo tài khoản',
    icon: 'person_add',
    bg: 'bg-sky-500/10 text-sky-600',
    description: 'Truy cập vào hệ thống và đăng ký tài khoản bằng số điện thoại của phụ huynh hoặc mã học sinh. Đảm bảo thông tin liên lạc chính xác để nhận thông báo từ trường.'
  },
  {
    step: 2,
    title: 'Kê khai thông tin',
    icon: 'edit_square',
    bg: 'bg-amber-500/10 text-amber-600',
    description: 'Điền đầy đủ thông tin cá nhân của học sinh, thông tin gia đình và lịch sử học tập. Kiểm tra kỹ các thông tin về giải thưởng hoặc thành tích đặc biệt (nếu có).'
  },
  {
    step: 3,
    title: 'Tải lên hồ sơ',
    icon: 'cloud_upload',
    bg: 'bg-emerald-500/10 text-emerald-600',
    description: 'Chụp ảnh hoặc scan các giấy tờ gốc theo yêu cầu (Giấy khai sinh, Học bạ, CCCD/Mã số định danh). Đảm bảo file hình ảnh rõ nét, không bị mất góc.'
  },
  {
    step: 4,
    title: 'Theo dõi kết quả',
    icon: 'event_note',
    bg: 'bg-indigo-500/10 text-indigo-600',
    description: 'Sau khi nhấn "Gửi hồ sơ", hệ thống sẽ gửi xác nhận qua SMS/Email. Phụ huynh có thể tra cứu trạng thái xét tuyển bất cứ lúc nào tại mục "Tra cứu".'
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
    name: 'Mã số định danh',
    description: 'Giấy xác nhận thông tin về cư trú (CT07) hoặc thông báo số định danh cá nhân.',
    tag: 'Thông tin cư trú',
    tagColor: 'text-sky-600 bg-sky-500/10 border-sky-200',
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
  address: 'TDP Trung 7, Tây Tựu, Quận Bắc Từ Liêm, Hà Nội',
  fatherName: 'Nguyễn Công Thắng',
  motherName: 'Lê Minh Hằng',
  phoneNumber: '0912345678',
  email: 'phuhuynh.minhanh@gmail.com',
  birthCertFile: 'giay_khai_sinh_minhanh.pdf',
  photoFile: 'anh_the_minhanh.png',
  reportCardFile: 'hoc_ba_tieu_hoc_minhanh.pdf',
  status: 'DA_TIEP_NHAN',
  submittedAt: '2026-05-15 14:32:00',
  adminNotes: 'Phụ huynh vui lòng theo dõi thông báo tiếp theo về lịch phỏng vấn năng khiếu vào ngày 20/05/2026 qua email cá nhân.'
};
