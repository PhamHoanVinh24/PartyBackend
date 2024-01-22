using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("WORK_OS_CARD")]
    public class WORKOSCard
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CardID { get; set; }

        [Key, StringLength(100)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string CardName { get; set; }

        [StringLength(100)]
        public string ListCode { get; set; }

        [StringLength(255)]
        public string Labels { get; set; }

        [StringLength(255)]
        public string Member { get; set; }

        [StringLength(255)]
        public string CheckList { get; set; }

        [StringLength(255)]
        public string AttachmentList { get; set; }

        [StringLength(255)]
        public string CommentList { get; set; }

        public string Description { get; set; }

        [StringLength(255)]
        public string WorkType { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string CardLevel { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal Completed { get; set; }

        public DateTime? CompletedTime { get; set; }

        public decimal Cost { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        public DateTime Deadline { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        public DateTime BeginTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal WeightNum { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal Progress { get; set; }

        public decimal? Quantitative { get; set; }

        public string Unit { get; set; }

        public DateTime CreatedDate { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public bool IsDeleted { get; set; }

        public string LstUser { get; set; }

        public string Inherit { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string ListUserView { get; set; }

        public string WorkflowCode { get; set; }

        public string JsonAssign { get; set; }

        public string JsonStatusLog { get; set; }

        public bool IsLock { get; set; }

        public string LockShare { get; set; }

        //public bool? IsRecurrent { get; set; }

        public string Cycle { get; set; }
    }

    public class WorkOsCardCustomMobile
    {
        public string CardCode { get; set; }
        public string ChkListCode { get; set; }
        public decimal Progress { get; set; }
        public List<CardAttachment> ListAttachment { get; set; }
        public List<int> ListDeleteAttachment { get; set; }
        public List<CardSubitemCheck> ListSubitem { get; set; }
        public List<int> ListDeleteSubitem { get; set; }
        public List<CardCommentList> ListComment { get; set; }
        public List<int> ListDeleteComment { get; set; }
    }
}
