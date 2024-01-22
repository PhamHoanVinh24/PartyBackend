using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_ACC_ENTRY")]
    public class FundAccEntry
    {
        public FundAccEntry()
        {
            ListStatusObjectLog = new List<JsonLog>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string AetCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string AetType { get; set; }

        [StringLength(255)]
        public string AetDescription { get; set; }

        public bool? IsPlan { get; set; }
        public bool? IsCompleted { get; set; }
        [StringLength(100)]
        public string CatCode { get; set; }

        public DateTime? DeadLine { get; set; }

        [StringLength(255)]
        public string AetRelative { get; set; }

        [StringLength(255)]
        public string AetRelativeType { get; set; }

        [StringLength(255)]
        public string Payer { get; set; }

        [StringLength(255)]
        public string Receiptter { get; set; }

        public decimal Total { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(500)]
        public string GoogleMap { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        public string Status { get; set; }

        public string LogData { get; set; }

        public string StatusObject { get; set; }

        public string StatusObjectLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatusObjectLog);
            }
            set
            {
                ListStatusObjectLog = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListStatusObjectLog { get; set; }

        [StringLength(100)]
        public string ObjCode { get; set; }

        [StringLength(50)]
        public string ObjType { get; set; }
        public string WorkflowCat { get; set; }
    }
    public class FundAccEntryModel
    {
        public FundAccEntryModel()
        {
            ListFileAccEntry = new List<FundFile>();
            ListFileAccEntryRemove = new List<FundFile>();
            ListStatusObjectLog = new List<JsonLog>();
        }
        public int Id { get; set; }

        [StringLength(100)]
        public string AetCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string AetType { get; set; }

        [StringLength(255)]
        public string AetDescription { get; set; }

        public bool? IsPlan { get; set; }
        public bool? IsCompleted { get; set; }
        [StringLength(100)]
        public string CatCode { get; set; }

        public string DeadLine { get; set; }

        [StringLength(255)]
        public string AetRelative { get; set; }

        [StringLength(255)]
        public string AetRelativeType { get; set; }

        [StringLength(255)]
        public string Payer { get; set; }

        [StringLength(255)]
        public string Receiptter { get; set; }

        public decimal Total { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        [StringLength(500)]
        public string GoogleMap { get; set; }

        [StringLength(255)]
        public string Address { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string StatusObject { get; set; }

        public List<JsonLog> ListStatusObjectLog { get; set; }

        public string LogData { get; set; }

        [StringLength(255)]
        public string Note { get; set; }
        [StringLength(255)]
        public string CreateBy { get; set; }

        public List<FundFile> ListFileAccEntry { get; set; }

        public List<FundFile> ListFileAccEntryRemove { get; set; }

        public string ObjCode { get; set; }

        public string ObjType { get; set; }

        public string WorkflowCat { get; set; }
        public string ActRepeat { get; set; }
    }

    public class FundAccEntryResultModel
    {
        public FundAccEntryResultModel()
        {
            ListFundAccEntry = new List<FundAccEntry>();
        }
        public List<FundAccEntry> ListFundAccEntry { get; set; }
     
        public decimal TotalReceipt { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalSurplus { get; set; }
    }

    public class FundFile
    {
        public int? Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string ContentType { get; set; }
    }

    public class FundAccChartModel
    {
        public FuncAccEntryCountModel CountModel { get; set; }
        public string Date { get; set; }
    }

    public class FuncAccEntryCountModel
    {
        public decimal TotalReceipt { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalSurplus { get; set; }

        public decimal TotalReceiptApproved { get; set; }
        public decimal TotalExpenseApproved { get; set; }
        public decimal TotalSurplusApproved { get; set; }
        public bool? IsVnd { get; set; }
    }

    //List danh sách thu chi tổng tiền trong danh sách, tìm kiếm
    public class ViewAccEntry
    {
        public int Id { get; set; }
        public string AetCode { get; set; }
        public string Title { get; set; }
        public string AetType { get; set; }
        public string AetTypeName { get; set; }
        public string CatCode { get; set; }
        public string CatName { get; set; }
        public DateTime? DeadLine { get; set; }
        public string Payer { get; set; }
        public string Receiptter { get; set; }
        public decimal Total { get; set; }
        public string Currency { get; set; }
        public string CreatedBy { get; set; }
        public string SCreatedTime { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string Status { get; set; }
        public string AetRelativeType { get; set; }
        public string AetDescription { get; set; }
        public int IsApprove { get; set; }
        public string TimeAlive { get; set; }
        public int IsOutTime { get; set; }
        //public ActGrid LastAct { get; set; }
        public JsonLog LastLog { get; set; }
        public string SLastLog { get; set; }
        public bool IsEndActApproved { get; set; }
        //public List<ActGrid> ListAct { get; set; }
    }
    public class FundAccEntryExportModel
    {
        public int? No { get; set; }
        public string DeadLine { get; set; }
        public string CatName { get; set; }
        public string Title { get; set; }
        public string AetType { get; set; }
        public decimal Total { get; set; }
        public string Currency { get; set; }
        public string Payer { get; set; }
        public string Receiptter { get; set; }
        public string Status { get; set; }
    }
}
