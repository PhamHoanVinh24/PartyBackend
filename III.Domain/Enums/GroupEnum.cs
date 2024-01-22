using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace III.Domain.Enums
{
    //Group Enum lấy dữ liệu combobox
    public enum EmployeeEnum
    {
        [Display(Name = "EMPLOYEE")]
        [Description("Nhân sự")]
        Employee = 1,

        [Display(Name = "EMPLOYEE_TYPE")]
        [Description("Loại nhân viên")]
        EmployeeType = 2,

        [Display(Name = "EMPLOYEE_GROUP")]
        [Description("Nhóm nhân viên")]
        EmployeeGroup = 3,

        [Display(Name = "EMPLOYEE_STYLE")]
        [Description("Kiểu nhân viên")]
        EmployeeStyle = 4,

        [Display(Name = "EMPLOYEE_HOLIDAY")]
        [Description("Ngày nghỉ lễ")]
        EmployeeHoliday = 5,

        [Display(Name = "EMPLOYEE_GROUP_NOTWORK")]
        [Description("Có lương/Không lương")]
        EmployeeGroupNotWork = 6,
    }
    public enum CMSEnum
    {
        [Display(Name = "CMS")]
        [Description("Quản lý nội dung")]
        CMS = 1,

        [Display(Name = "CMS_TEMPLATE")]
        [Description("Template")]
        CMSTemplate = 2,
        [Display(Name = "CMS_BLOCK")]
        [Description("Danh sách Block hiển thị")]
        CMSBlock = 3,

    }

    public enum ContractEnum
    {
        [Display(Name = "CONTRACT")]
        [Description("Hợp đồng")]
        Contract = 1,

        [Display(Name = "CONTRACT_TYPE")]
        [Description("Loại hợp đồng")]
        ContractType = 2,

        [Display(Name = "CONTRACT_STATUS")]
        [Description("Trạng thái hợp đồng")]
        ContractStatus = 3,

        [Display(Name = "CONTRACT_EXTEND_GROUP")]
        [Description("Thuộc tính mở rộng của hợp đồng")]
        ContractExtend = 4,

        [Display(Name = "CONTRACT_STATUS_PO_CUS")]
        [Description("Trạng thái hợp đồng/Đơn hàng")]
        ContractStatusPoCus = 5,

        [Display(Name = "CONTRACT_STATUS_PO_SUP")]
        [Description("Trạng thái đặt hàng(Nhà cung cấp)")]
        ContractStatusPoSup = 6,

        [Display(Name = "CONTRACT_RELATIVE")]
        [Description("Mối liên hệ")]
        ContractRelative = 7,

        [Display(Name = "REQUEST_IMPORT_PRODUCT")]
        [Description("Y/C đặt hàng")]
        RequestImportProduct = 8,

        [Display(Name = "REQUEST_WORK_PRICE")]
        [Description("Y/C hỏi giá")]
        RequestWorkPrice = 9,
    }

    public enum PoSupplierEnum
    {
        [Display(Name = "PO_SUPPLIER")]
        [Description("Đặt hàng nhà cung cấp")]
        PoSupplier = 1,
    }

    public enum SupplierEnum
    {
        [Display(Name = "SUPPLIER")]
        [Description("Nhà cung cấp")]
        Supplier = 1,

        [Display(Name = "SUPPLIER_GROUP")]
        [Description("Nhóm nhà cung cấp")]
        SupplierGroup = 2,

        [Display(Name = "SUPPLIER_STATUS")]
        [Description("Trạng thái nhà cung cấp")]
        SupplierStatus = 3,

        [Display(Name = "SUPPLIER_ROLE")]
        [Description("Trạng thái nhà cung cấp")]
        SupplierRole = 4,

        [Display(Name = "SUPPLIER_TYPE")]
        [Description("Loại nhà cung cấp")]
        SupplierType = 5,
    }

    public enum CustomerEnum
    {
        [Display(Name = "CUSTOMER")]
        [Description("Khách hàng")]
        Customer = 1,

        [Display(Name = "CUSTOMER_GROUP")]
        [Description("Nhóm khách hàng")]
        CustomerGroup = 2,

        [Display(Name = "CUSTOMER_ROLE")]
        [Description("Vai trò khách hàng")]
        CustomerRole = 3,


        [Display(Name = "CUSTOMER_STATUS")]
        [Description("Trạng thái khách hàng")]
        CustomerStatus = 4,

        [Display(Name = "CUSTOMER_TYPE")]
        [Description("Loại khách hàng")]
        CustomerType = 5,
    }

    public enum HrEmployeeEnum
    {
        [Display(Name = "EMPLOYEE")]
        [Description("Khách hàng")]
        HrEmployeeEnum = 1,
    }

    public enum CustomerRoleEnum
    {
        [Display(Name = "CUSTOMER_AGENCY")]
        [Description("Đại lý")]
        Agency = 1,

        [Display(Name = "CUSTOMER_ARCHITECTURAL")]
        [Description("Công ty Kiến trúc/Người giới thiệu")]
        Architectural = 2,

        [Display(Name = "CUSTOMER_PROJECT")]
        [Description("Dự án")]
        Project = 3,

        [Display(Name = "CUSTOMER_RETAIL")]
        [Description("Khách lẻ")]
        Retail = 4,

        [Display(Name = "CUSTOMER_ROLE_OTHER")]
        [Description("Khác")]
        Other = 5,
    }

    public enum AssetEnum
    {
        [Display(Name = "ASSET")]
        [Description("Tài sản")]
        Asset = 1,

        [Display(Name = "ASSET_TYPE")]
        [Description("Loại tài sản")]
        AssetType = 2,

        [Display(Name = "ASSET_GROUP")]
        [Description("Nhóm tài sản")]
        AssetGroup = 3,

        [Display(Name = "ASSET_ACTIVITY_TYPE")]
        [Description("Hoạt động của tài sản")]
        AssetActivityType = 4,
    }

    public enum ServiceEnum
    {
        [Display(Name = "SERVICE")]
        [Description("Dịch vụ")]
        Service = 1,

        [Display(Name = "MAIN_SERVICE")]
        [Description("Dịch vụ chính")]
        MainService = 2,

        [Display(Name = "SERVICE_GROUP")]
        [Description("Nhóm dịch vụ")]
        ServiceGroup = 3,

        [Display(Name = "SERVICE_UNIT")]
        [Description("Đơn vị dịch vụ")]
        ServiceUnit = 4,

        [Display(Name = "SERVICE_UNIT_VALUE")]
        [Description("Đơn vị giá trị")]
        ServiceUnitValue = 5,

        [Display(Name = "SERVICE_CONDITION")]
        [Description("Điều kiện ràng buộc")]
        ServiceCondition = 6,

        [Display(Name = "SERVICE_STATUS")]
        [Description("Trạng thái dịch vụ")]
        ServiceStatus = 7,

        [Display(Name = "SERVER_LEVEL")]
        [Description("Cấp độ dịch vụ")]
        ServiceLevel = 8,
    }

    public enum PaymentEnum
    {
        [Display(Name = "PAYMENT")]
        [Description("Thanh toán")]
        Payment = 1,

        [Display(Name = "PAY_OBJ_TYOE")]
        [Description("Đối tượng thanh toán")]
        PayObjTyoe = 2,

        [Display(Name = "PAY_TYPE")]
        [Description("Loại thanh toán")]
        PayType = 3,

        [Display(Name = "PAY_RATE")]
        [Description("Payment Rate")]
        PayRate = 4,

        [Display(Name = "COMMISSION_RATE")]
        [Description("Commission Rate")]
        CommissionRate = 5
    }

    public enum PublishEnum
    {
        [Display(Name = "PUBLISH")]
        [Description("Phần dùng chung")]
        Publish = 1,

        [Display(Name = "STATUS")]
        [Description("Trạng thái")]
        Status = 2,

        [Display(Name = "ORIGIN")]
        [Description("Xuất xứ")]
        Origin = 3,

        [Display(Name = "CURRENCY_TYPE")]
        [Description("Loại tiến")]
        CurrencyType = 4,

        [Display(Name = "UNIT")]
        [Description("Đơn vị")]
        Unit = 5,

        [Display(Name = "PRODUCT_GROUP")]
        [Description("Nhóm sản phẩm")]
        ProductGroup = 6,

        [Display(Name = "TASK")]
        [Description("Công việc")]
        Task = 7,

        [Display(Name = "PROGRAM_LANGUAGE")]
        [Description("Ngôn ngữ")]
        ProgramLanguage = 8,

        [Display(Name = "TABLE")]
        [Description("Số dòng hiển thị trong 1 bảng")]
        Table = 9,

        [Display(Name = "ATTR_UNIT")]
        [Description("Đơn vị thuộc tính")]
        AttrUnit = 10,

        [Display(Name = "ATTR_GROUP")]
        [Description("Nhóm thuộc tính")]
        AttrGroup = 11,

        [Display(Name = "ATTR_DATA_TYPE")]
        [Description("Kiểu dữ liệu")]
        AttrDataType = 12,

        [Display(Name = "DURATION_UNIT")]
        [Description("Đơn vị thời lượng")]
        DurationUnit = 13,

        [Display(Name = "GROUP_ACTIVITY")]
        [Description("Nhóm hoạt động")]
        GroupActivity = 14,

        [Display(Name = "TYPE_ACTIVITY")]
        [Description("Loại hoạt động")]
        TypeActivity = 15,

        [Display(Name = "STATUS_ACTIVITY")]
        [Description("Trạng thái hoạt động")]
        StatusActivity = 16,

        [Display(Name = "MILE_STONE")]
        [Description("Miles stone")]
        MilesStone = 17,

        [Display(Name = "CARD_JOB")]
        [Description("Card job object")]
        TypeInstCard = 18,

        [Display(Name = "SHARP_LIBRARY")]
        [Description("Thư viện ký hiệu")]
        SharpLibrary = 19,

        [Display(Name = "CARD_DATA_LOGGER")]
        [Description("Nhóm dữ liệu mẫu")]
        CardDataLogger = 20,

        [Display(Name = "STATUS_ACTIVITY_APPROVED")]
        [Description("Duyệt activity instance")]
        ApprovedActInst = 21,

        [Display(Name = "STATUS_ACTIVITY_STOP")]
        [Description("Trạng thái dừng activity Instace")]
        StopActInst = 22,

        [Display(Name = "FILE_ACT_INST")]
        [Description("File từ activity instance")]
        FileVersionActInst = 23,

        [Display(Name = "STATUS_ACTIVITY_DO")]
        [Description("Trạng thái đang xử lý activity instace")]
        DoActInst = 24,

        [Display(Name = "ROLE_ACT_ASSIGN")]
        [Description("Vai trò của nhân viên trong activity")]
        RoleActAssign = 25,

        [Display(Name = "OBJ_WORKTYPE_REPEAT")]
        [Description("Kiểu công việc lặp lại")]
        CardWorktypeRepeat = 26,

        [Display(Name = "PAY_TITLE")]
        [Description("Chức danh")]
        PayTitle = 27,

        [Display(Name = "PAY_CERTIFICATE")]
        [Description("Bằng cấp/Trình độ")]
        PayCertificate = 28,

        [Display(Name = "PAY_MAJOR")]
        [Description("Chuyên môn")]
        PayMajor = 29,

        [Display(Name = "DECISION_STATUS")]
        [Description("Trạng thái đang xử lý activity instace")]
        StatusActWF = 30,

        [Display(Name = "DECISION_STATUS_REPEAT")]
        [Description("Trạng thái đang xử lý activity instace")]
        StatusActWFREPEAT = 31,

        [Display(Name = "DECISION_STATUS_FINAL")]
        [Description("Trạng thái đang xử lý activity instace")]
        StatusActWFFINAL = 32,

        [Display(Name = "LMS_SUBJECT_GROUP")]
        [Description("Nhóm danh mục chuyên môn")]
        LmsSubjectGroup = 33,

        [Display(Name = "LMS_SUBJECT_TYPE")]
        [Description("Loại danh mục chuyên môn")]
        LmsSubjectType = 34,

        [Display(Name = "DECISION_END_STATUS")]
        [Description("Kiểu trạng thái hoàn thành")]
        DecisionEnd = 35,
    }

    public enum ProjectEnum
    {
        [Display(Name = "PROJECT")]
        [Description("Dự án")]
        Project = 1,

        [Display(Name = "PRO_CURENCY")]
        [Description("Đơn vị")]
        ProCurrency = 2,

        [Display(Name = "PRO_STATUS")]
        [Description("Trạng thái")]
        ProStatus = 3,

        [Display(Name = "PRO_TYPE")]
        [Description("Loại dự án")]
        ProType = 4,

        [Display(Name = "PRO_SET_PRIORITY")]
        [Description("Thiết lập ưu tiên")]
        ProSetPriority = 5,

        [Display(Name = "PRO_ROLE")]
        [Description("Vai trò")]
        ProRole = 6,
    }

    public enum CardEnum
    {
        [Display(Name = "CARDJOB")]
        [Description("Thẻ việc")]
        CardJob = 1,

        [Display(Name = "OBJ_DEPENDENCY")]
        [Description("Đối tượng liên quan")]
        ObjDependency = 2,

        [Display(Name = "OBJ_WORKTYPE")]
        [Description("Loại công việc")]
        ObjWorkType = 3,

        [Display(Name = "OBJ_RELATIVE")]
        [Description("Quan hệ")]
        ObjRelative = 4,

        [Display(Name = "STATUS")]
        [Description("Trạng thái")]
        Stautus = 5,

        [Display(Name = "LEVEL")]
        [Description("Cấp độ")]
        Level = 6,

        [Display(Name = "CARD_ROLE")]
        [Description("Vai trò")]
        Role = 7,

        [Display(Name = "TeamAssign")]
        [Description("Nhóm được giao việc")]
        TeamAssignWork = 8,

        [Display(Name = "DepartmentAssign")]
        [Description("Phòng được giao việc")]
        DepartmentAssignWork = 9,

        [Display(Name = "NOTIFICATION")]
        [Description("Thông báo")]
        Notification = 10,

        [Display(Name = "NOTIFICATION_CARD")]
        [Description("Mã cài đặt thông báo thẻ việc")]
        NotificationCard = 11,

        [Display(Name = "YES")]
        [Description("Giá trị cài đặt thông báo thẻ việc")]
        NotificationCardYes = 11,

        [Display(Name = "NO")]
        [Description("Giá trị cài đặt thông báo thẻ việc")]
        NotificationCardNo = 11,

        [Display(Name = "OTP")]
        [Description("Gửi OTP")]
        SendOtp = 12,

        [Display(Name = "ITEM_REQUEST")]
        [Description("Tệp tin yêu cầu")]
        ItemRequest = 13,

        [Display(Name = "ITEM_RESULT")]
        [Description("Tệp tin kết quả")]
        ItemResult = 14,
    }

    public enum WarehouseEnum
    {
        [Display(Name = "WAREHOUSE")]
        [Description("Kho và bán hàng")]
        Warehouse = 1,

        [Display(Name = "IMP_STATUS")]
        [Description("Yêu cầu đặt hàng")]
        ImpStatus = 2,

        [Display(Name = "UNIT")]
        [Description("Đơn vị sản phẩm")]
        UnitProduct = 3,
        [Display(Name = "CAT_STATUS")]
        [Description("Trạng thái danh mục sản phẩm")]
        CatStatus = 4,

        [Display(Name = "PRICE_STATUS")]
        [Description("Yêu cầu hỏi giá")]
        PriceStatus = 5,
    }

    public enum FundEnum
    {
        [Display(Name = "FUND")]
        [Description("Quản lỹ quỹ")]
        Fund = 1,

        [Display(Name = "FUND_RELATIVE")]
        [Description("Quan hệ")]
        FundRelative = 2,
    }

    public enum CommonEnum
    {
        [Display(Name = "AREA")]
        [Description("Vùng khách hàng,Nhà cung cấp")]
        Area = 1,

        [Display(Name = "UNIT")]
        [Description("Đơn vị")]
        Unit = 2,

        [Display(Name = "CURRENCY_TYPE")]
        [Description("Loại tiền")]
        Currency = 3,
    }

    public enum DataTypeEnum
    {
        [Display(Name = "NUMBER")]
        [Description("Số")]
        Number = 1,

        [Display(Name = "TEXT")]
        [Description("Chuỗi kí tự")]
        Text = 2,

        [Display(Name = "DATETIME")]
        [Description("Ngày tháng")]
        DateTime = 3,

        [Display(Name = "MONEY")]
        [Description("Tiền tệ")]
        Money = 4,
    }

    public enum TypeConnection
    {
        [Display(Name = "DRIVER")]
        [Description("Google driver")]
        GooglerDriver = 1,

        [Display(Name = "DROPBOX")]
        [Description("Dropbox")]
        DropBox = 2,

        [Display(Name = "SERVER")]
        [Description("Server")]
        Server = 3,
    }

    public enum UnitDuration
    {
        [Display(Name = "DATE")]
        [Description("Ngày")]
        Date = 1,

        [Display(Name = "MONTH")]
        [Description("Tháng")]
        Month = 2,

        [Display(Name = "YEAR")]
        [Description("Năm")]
        Year = 3,
    }

    public enum TypeWork
    {
        [Display(Name = "P")]
        [Description("PartTime")]
        P = 1,

        [Display(Name = "F")]
        [Description("FullTime")]
        F = 2,
    }

    public enum EnumMaterialProduct
    {
        [Display(Name = "PRODUCT")]
        [Description("Sản phẩm")]
        Product = 1,

        [Display(Name = "PRODUCT_IMP_TYPE")]
        [Description("Loại hình nhập kho")]
        ProductImpType = 2,

        [Display(Name = "PROD_IN_STOCK")]
        [Description("Sản phẩm tồn kho")]
        ProductInStock = 3,
    }

    public enum PriceAgency
    {
        [Display(Name = "PRICE_COST_CATELOGUE")]
        [Description("Giá đại lý catalogue")]
        Catelogue = 1,

        [Display(Name = "PRICE_COST_AIRLINE")]
        [Description("Giá đại lý đường bay")]
        Airline = 2,

        [Display(Name = "PRICE_COST_SEA")]
        [Description("Giá đại lý đường biển")]
        Sea = 3,
    }

    public enum PriceRetail
    {
        [Display(Name = "PRICE_RETAIL_BUILD")]
        [Description("Giá bán lẻ có thi công")]
        Buid = 1,

        [Display(Name = "PRICE_RETAIL_BUILD_AIRLINE")]
        [Description("Giá bán lẻ có thi công bay")]
        Airline = 2,

        [Display(Name = "PRICE_RETAIL_BUILD_SEA")]
        [Description("Giá bán lẻ có thi công kho,biển")]
        Sea = 3,

        [Display(Name = "PRICE_RETAIL_NO_BUILD")]
        [Description("Giá bán lẻ không thi công")]
        NoBuid = 4,

        [Display(Name = "PRICE_RETAIL_NO_BUILD_AIRLINE")]
        [Description("Giá bán lẻ không thi công bay")]
        NoBuidAirline = 5,

        [Display(Name = "PRICE_RETAIL_NO_BUILD_SEA")]
        [Description("Giá bán lẻ không thi công kho, biển")]
        NoBuidSea = 6,
    }

    public enum All
    {
        [Display(Name = "All")]
        [Description("Tất cả")]
        All = 1,
    }

    public enum StaffEnum
    {
        [Display(Name = "Shift")]
        [Description("Ca làm việc")]
        Shift = 1,
    }

    public enum UserEnum
    {
        [Display(Name = "ROLE_COMBINATION")]
        [Description("Loại hình")]
        Combination = 1,
    }

    public enum MappingEnum
    {
        [Display(Name = "MAPPING_RELATIVE")]
        [Description("Quan hệ")]
        Relative = 1,

        [Display(Name = "REQ_PRICE")]
        [Description("Y/C đặt hàng")]
        RqPrice = 2,

        [Display(Name = "PO_BUY")]
        [Description("Hợp đồng mua")]
        PoBuy = 3,

        [Display(Name = "PROJECT")]
        [Description("Dự án")]
        Project = 4,

        [Display(Name = "PO_SALE")]
        [Description("Hợp đồng bán")]
        PoSale = 5,
    }

    public enum UserBusyOrFreeEnum
    {
        [Display(Name = "STAFF_BUSY")]
        [Description("Bận")]
        Busy = 0,
        [Display(Name = "STAFF_FREE")]
        [Description("Rảnh")]
        Free = 1,
    }

    public enum FromSrcSendNotify
    {
        [Display(Name = "FROM_CARD_JOB")]
        [Description("Thẻ việc")]
        FromCardJob = 0,

        [Display(Name = "FROM_ACTVITY_INST")]
        [Description("Thể hiện hoạt động")]
        FromActInst = 1,

        [Display(Name = "FROM_FUND")]
        [Description("Quỹ")]
        FromFund = 2,

        [Display(Name = "CALLVIDEO")]
        [Description("Call video")]
        FromCallVideo = 3,

        [Display(Name = "MEETING")]
        [Description("Meeting")]
        FromMeeting = 4,

        [Display(Name = "TUTORING")]
        [Description("Tutoring")]
        FromTutoring = 5,

        [Display(Name = "LMS_TASK")]
        [Description("LmsTask")]
        FromLmsTask = 6,

        [Display(Name = "WEEK_WORKING")]
        [Description("LmsTask")]
        FromWeekWorking = 7,

        [Display(Name = "URGENT_NOTI")]
        [Description("UrgentNoti")]
        FromUrgentNoti = 8,

        [Display(Name = "OTHER")]
        [Description("Other")]
        FromOther = 9,
    }

    public enum ActivityCat
    {
        [Display(Name = "ACT_CAT")]
        [Description("Activity cat")]
        ActivityCat = 1,
    }

    public enum ActivityInst
    {
        [Display(Name = "ACT_INST")]
        [Description("Activity instance")]
        ActivityInst = 1,
    }

    public enum OrderRequestRawEnum
    {
        [Display(Name = "RQ_RAW")]
        [Description("Request raw")]
        RqRaw = 1,
    }

    public enum Recruitment
    {
        [Display(Name = "RECRUITMENT_EXC_HEADER")]
        [Description("Thông tin bài thi tuyển dụng")]
        RecruitmentExcHeader = 1,

        [Display(Name = "RECRUITMENT_EXC_DETAIL")]
        [Description("Chi tiết bài thi tuyển dụng")]
        RecruitmentExcDetail = 2,
    }

    public enum ObjectType
    {
        [Display(Name = "CUSTOMER")]
        [Description("Khách hàng")]
        Customer = 1,

        [Display(Name = "SUPPLIER")]
        [Description("Nhà cung cấp")]
        Supplier = 2,

        [Display(Name = "RQ_RAW")]
        [Description("Thông tin cơ hội")]
        OrderRqRaw = 3,

        [Display(Name = "PROJECT")]
        [Description("Dự án/ đấu thầu")]
        Project = 4,

        [Display(Name = "CONTRACT")]
        [Description("Hợp đồng bán")]
        Contract = 5,

        [Display(Name = "PO_SUPPLIER")]
        [Description("Hợp đồng mua")]
        ContractPo = 6,

        [Display(Name = "REQUEST_IMPORT_PRODUCT")]
        [Description("Y/C đặt hàng")]
        RqImportProduct = 7,

        [Display(Name = "REQUEST_WORK_PRICE")]
        [Description("Y/C hỏi giá")]
        RqPrice = 8,

        [Display(Name = "EMPLOYEE")]
        [Description("Nhân sự")]
        Employee = 9,

        [Display(Name = "PRODUCT")]
        [Description("Danh mục thiết bị và vật tư")]
        Product = 10,

        [Display(Name = "MATERIAL_STORE")]
        [Description("Danh mục kho")]
        MaterialStore = 11,

        [Display(Name = "ACT_CAT")]
        [Description("Dựng quy trình")]
        ActCat = 12,

        [Display(Name = "ASSET")]
        [Description("Sổ tài sản")]
        Asset = 13,

        [Display(Name = "WHP_ASSET")]
        [Description("Kho tài sản")]
        WhpAsset = 14,

        [Display(Name = "ASSET_INVENTORY")]
        [Description("Kiểm kê tài sản")]
        AssetInventory = 15,

        [Display(Name = "ASSET_ALLOCATE")]
        [Description("Cấp phát tài sản")]
        AssetAllocate = 16,

        [Display(Name = "ASSET_BUY")]
        [Description("Mua sắm tài sản")]
        AssetBuy = 17,

        [Display(Name = "ASSET_TRANSFER")]
        [Description("Điều chuyển tài sản")]
        AssetTransfer = 18,

        [Display(Name = "ASSET_LIQUIDATION")]
        [Description("Thanh lý tài sản")]
        AssetLiqui = 19,

        [Display(Name = "ASSET_RECALL")]
        [Description("Thu hồi tài sản")]
        AssetRecall = 20,

        [Display(Name = "ASSET_RQ_REPAIR")]
        [Description("Yêu cầu sửa chữa bảo dưỡng tài sản")]
        AssetRqRepair = 21,

        [Display(Name = "ASSET_MAINTENACE")]
        [Description("Sửa chữa tài sản")]
        AssetMaintenance = 22,

        [Display(Name = "ASSET_IMPROVE")]
        [Description("Bảo dưỡng tài sản")]
        AssetImprove = 23,

        [Display(Name = "ASSET_CANCEL")]
        [Description("Hủy tài sản")]
        AssetCancel = 24,

        [Display(Name = "ASSET_RPT")]
        [Description("Báo hỏng/mất tài sản")]
        AssetRpt = 25,

        [Display(Name = "ACT_INST")]
        [Description("Thể hiện hoạt động")]
        ActInst = 26,

        [Display(Name = "CARDJOB")]
        [Description("Thẻ việc")]
        Cardjob = 27,

        [Display(Name = "FUND_ACC_ENTRY")]
        [Description("Phiếu thu/chi")]
        FundAccEntry = 28,

        [Display(Name = "ITEM")]
        [Description("Đầu mục")]
        Item = 28,
    }

    public enum EnumWfGroup
    {
        [Display(Name = "WF_GROUP_PAYMENT")]
        [Description("Nhóm luồng phiếu chi")]
        Payment = 1,

        [Display(Name = "WF_GROUP_RECEIPT")]
        [Description("Nhóm luồng phiếu thu")]
        Receipt = 2,
    }

    public enum CardStatus
    {
        [Display(Name = "CANCLED")]
        [Description("Bị hủy")]
        Cancel = 1,

        [Display(Name = "CLOSED")]
        [Description("Đóng")]
        Close = 2,

        [Display(Name = "CREATED")]
        [Description("Mới tạo")]
        Created = 3,

        [Display(Name = "DONE")]
        [Description("Hoàn thành")]
        Done = 4,

        [Display(Name = "START")]
        [Description("Đang triển khai")]
        Start = 5,

        [Display(Name = "TRASH")]
        [Description("Thẻ rác")]
        Trash = 6,
    }

    public enum IotEnum
    {
        [Display(Name = "DEVICE_IOT_GROUP")]
        [Description("Nhóm thiết bị IOT")]
        IotGroup = 1,

        [Display(Name = "DEVICE_IOT_TYPE")]
        [Description("Loại thiết bị IOT")]
        IotType = 2,

        [Display(Name = "DEVICE_IOT_STATUS")]
        [Description("Trạng thái thiết bị IOT")]
        IotStatus = 3,

        [Display(Name = "ZONE_IOT_STATUS")]
        [Description("Trạng thái khu vực")]
        ZoneStatus = 4,
    }

    public enum TypeIotDevice
    {
        [Display(Name = "DEVICE_IOT_TYPE_CAMERA")]
        [Description("Camera")]
        TypeCamera = 1,

        [Display(Name = "DEVICE_IOT_TYPE_SENSOR")]
        [Description("Cảm biến")]
        TypeSensor = 2,

        [Display(Name = "DEVICE_IOT_TYPE_RFID")]
        [Description("Rfid")]
        TypeRfid = 3,
    }

    public enum RecordsPackEnum
    {
        [Display(Name = "PACK_GROUP")]
        [Description("Pack group")]
        PackGroup = 1,

        [Display(Name = "PACK_TYPE")]
        [Description("Pack type")]
        PackType = 2,
    }

    public enum ZoneManagerEnum
    {
        [Display(Name = "ZONE_GROUP")]
        [Description("Nhóm vùng")]
        ZoneGroup = 1,

        [Display(Name = "ZONE_TYPE")]
        [Description("Kiểu vùng")]
        ZoneType = 2,
    }

    public enum TypeActivity
    {
        [Display(Name = "TYPE_ACTIVITY_INITIAL")]
        [Description("Bắt đầu")]
        Initial = 1,

        [Display(Name = "TYPE_ACTIVITY_REPEAT")]
        [Description("Lặp lại")]
        Repeat = 2,

        [Display(Name = "TYPE_ACTIVITY_END")]
        [Description("Kết thúc")]
        EndAct = 3,
    }

    public enum NotificationType
    {
        [Display(Name = "CARD_JOB")]
        [Description("Thẻ việc")]
        CardJob = 1,

        [Display(Name = "CONTRACT")]
        [Description("Hợp đồng bán")]
        Contract = 2,

        [Display(Name = "PROJECT")]
        [Description("Dự án")]
        Project = 3,

        [Display(Name = "CMS")]
        [Description("Tin tức")]
        Cms = 4,

        [Display(Name = "WORK_FLOW")]
        [Description("Luồng việc")]
        WorkFlow = 5,

        [Display(Name = "CONTRACT_PO")]
        [Description("Hợp đồng mua")]
        ContractPo= 6,
    }

    public enum CreatorAssign
    {
        [Display(Name = "WORKFLOW_WORKING_ROLE_USER")]
        [Description("Nhân viên xử lý hoạt động được thêm tự động")]
        Creator = 1,

        [Display(Name = "WORKFLOW_WORKING_ROLE_MANAGER")]
        [Description("Trưởng/phó phòng xử lý hoạt động được thêm tự động")]
        CreatorManager = 2,
    }

    //public enum ApiServiceEnum
    //{
    //    [Display(Name = "SERVICE_TYPE")]
    //    [Description("Kiểu dịch vụ được thêm tự động")]
    //    ServiceType = 1,
    //}
}
