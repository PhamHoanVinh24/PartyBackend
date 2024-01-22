using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PO_SUP_HEADER_PAYMENT")]
    public class PoSupHeaderPayment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string BuyerCode { get; set; }

        public string SupCode { get; set; }

        public string PoTitle { get; set; }

        public string PoSupCode { get; set; }

        public DateTime? DateOfOrder { get; set; }
        [NotMapped]
        public string sDateOfOrder { get; set; }
        public string OrderBy { get; set; }

        public string Email { get; set; }
        public string PaymentTerm { get; set; }
        public string ShippingAdd { get; set; }
        public string Consigner { get; set; }
        public string Mobile { get; set; }
        public string Buyer { get; set; }
        public string Noted { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public string Confirm { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        [NotMapped]
        public string sEstimateTime { get; set; }
        public DateTime? EstimateTime { get; set; }
        public string Currency { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? TotalPayment { get; set; }
    }
}
