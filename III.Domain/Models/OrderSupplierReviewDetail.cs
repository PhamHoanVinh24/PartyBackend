using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ORDER_SUPPLIER_REVIEW_DETAILS")]
    public class OrderSupplierReviewDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string SupplierCode { get; set; }

        [StringLength(255)]
        public string QcSystem { get; set; }

        [StringLength(255)]
        public string Pricing { get; set; }

        [StringLength(255)]
        public string Unit { get; set; } 
        
        [StringLength(255)]
        public string PaymentMethod { get; set; }


        [StringLength(255)]
        public string DeliveryTime { get; set; }
        [StringLength(255)]
        public string ReviewCode { get; set; }
        [StringLength(255)]
        public string Reputation { get; set; }

        [StringLength(255)]
        public string ResultReview { get; set; }

        [StringLength(255)]
        public string Noted { get; set; }
    }
}
