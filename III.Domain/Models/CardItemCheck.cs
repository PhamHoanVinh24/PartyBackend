using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_ITEM_CHECK")]
    public class CardItemCheck
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string CheckTitle { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        public DateTime? Finishtime { get; set; }

        [StringLength(255)]
        public string ChkListCode { get; set; }

        public int Percent { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal Completed { get; set; }

        public DateTime? CompletedTime { get; set; }

        public decimal? Cost { get; set; }

        public DateTime? Deadline { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        public DateTime? BeginTime { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal WeightNum { get; set; }

        public bool Flag { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
        public string Constraint { get; set; }
        public string WfInstCode { get; set; }
        public string ActInstCode { get; set; }
        public string Note { get; set; }
    }

    public class UserItemChkView
    {
        public int ID { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string GivenName { get; set; }
        public string EstimateTime { get; set; }
        public string Unit { get; set; }
        public DateTime CreatedTime { get; set; }
    }

    public class SubItemView
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Completed { get; set; }
        public bool Approve { get; set; }
    }

    public class FileItemCheckView
    {
        public int Id { get; set; }
        public string MemberId { get; set; }
        public string FileUrl { get; set; }
        public string FileName { get; set; }
        public string CreatedTime { get; set; }
        public string[] ListPermissionViewFile { get; set; }
    }

    public class ItemChecksView
    {
        public int Id { get; set; }
        public string ChkListCode { get; set; }
        public string CheckTitle { get; set; }
        public bool checkItem { get; set; }
        public decimal WeightNum { get; set; }
        public decimal Completed { get; set; }
        public string TitleSubItemChk { get; set; }
        public string Note { get; set; }
        public string CreatedBy { get; set; }
        public List<UserItemChkView> ListUserItemChk { get; set; }
        public List<SubItemView> listSubItem { get; set; }
        public List<FileItemCheckView> FileItemCheck { get; set; }
        public string CheckSuccess { get; set; }
        public bool CheckSuccessCode { get; set; }

        public DateTime CreatedTime { get; set; }
    }
    internal class TestClass
    {
        public string Test { get; set; }
    }
}
