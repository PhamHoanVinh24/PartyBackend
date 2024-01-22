using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CARD_SUBITEM_CHECK")]
    public class CardSubitemCheck
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ChkListCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        //public int? Status { get; set; }

        //[StringLength(255)]
        //public string MemberId { get; set; }

        //public DateTime? UpdatedTime { get; set; }

        //[StringLength(255)]
        //public string MemberChecked { get; set; }

        //public DateTime? TimeChecked { get; set; }

        //[Column(TypeName = "decimal(14,2)")]
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

        public bool Approve { get; set; }

        public string Approver { get; set; }

        public DateTime? ApprovedTime { get; set; }

        public bool Flag { get; set; }
    }
}
