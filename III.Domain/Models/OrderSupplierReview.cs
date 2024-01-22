using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ORDER_SUPPLIER_REVIEW")]
    public class OrderSupplierReview
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ReviewCode { get; set; }

        [StringLength(255)]
        public string TitleReview { get; set; }

        [StringLength(255)]
        public string CreatorTicket { get; set; }

        [StringLength(255)]
        public string DateReviewTicket { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(100)]
        public string Noted { get; set; }

        [StringLength(255)]
        public string SupplierResultReview { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdateTime { get; set; }

        [StringLength(50)]
        public string Flag { get; set; }
    }
}
