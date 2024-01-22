using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("MATERIAL_PAYMENT_TICKET")]
    public class MaterialPaymentTicket
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentTickitId { get; set; }

        [StringLength(100)]
        public string PayCode { get; set; }

        [StringLength(255)]
        public string PayTitle { get; set; }

        [StringLength(255)]
        public string PayNote { get; set; }

        
        public bool PayType { get; set; }

        [StringLength(50)]
        public string PayObjType { get; set; }

        [StringLength(100)]
        public string PayObjId { get; set; }

        public decimal MoneyTotal { get; set; }

        [StringLength(20)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string PayOfWay { get; set; }

        [StringLength(100)]
        public string PayerId { get; set; }

        [StringLength(100)]
        public string ReceiperId { get; set; }

        public DateTime? PayTimeCnt { get; set; }

        [StringLength(100)]
        public string PayRemain { get; set; }

        public DateTime? PayNextTime { get; set; }

        public decimal PayNextMoney { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

    }
    public class MaterialPaymentTicketModel
    {
        
        public int PaymentTickitId { get; set; }

        [StringLength(100)]
        public string PayCode { get; set; }

        [StringLength(255)]
        public string PayTitle { get; set; }

        [StringLength(255)]
        public string PayNote { get; set; }


        public bool PayType { get; set; }

        [StringLength(50)]
        public string PayObjType { get; set; }

        [StringLength(100)]
        public string PayObjId { get; set; }

        public decimal MoneyTotal { get; set; }

        [StringLength(20)]
        public string Currency { get; set; }

        [StringLength(50)]
        public string PayOfWay { get; set; }

        [StringLength(100)]
        public string PayerId { get; set; }

        [StringLength(100)]
        public string ReceiperId { get; set; }

        public string PayTimeCnt { get; set; }

        [StringLength(100)]
        public string PayRemain { get; set; }

        public string PayNextTime { get; set; }

        public decimal PayNextMoney { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public string CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public string UpdatedTime { get; set; }

    }
}
