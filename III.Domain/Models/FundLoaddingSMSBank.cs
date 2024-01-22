using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_LOADING_SMS_BANK")]
    public class FundLoaddingSMSBank
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ACC_Sender { get; set; }

        [StringLength(255)]
        public string Sender { get; set; }
        [StringLength(255)]
        public string ACC_Receiver { get; set; }

        [StringLength(255)]
        public string Receiver { get; set; }
        [StringLength(255)]
        public string MoneyTranfer { get; set; }
        [StringLength(255)]
        public string Currency { get; set; }
        public DateTime? TranferTime { get; set; }
        [StringLength(255)]
        public string ACC_Balance { get; set; }
        [StringLength(500)]
        public string SMS_Raw { get; set; }
        [StringLength(255)]
        public string SMS_Status { get; set; }
        [StringLength(255)]
        public string Created_By { get; set; }
        public DateTime? Created_Date { get; set; }
        [StringLength(255)]
        public string Updated_By { get; set; }
        public DateTime? Updated_Date { get; set; }
        [StringLength(255)]
        public string Deleted_By { get; set; }
        public DateTime? Deleted_Date { get; set; }
        public bool IsDeleted { get; set; }
        [StringLength(255)]
        public string CurrencyBalance { get; set; }
         public string Bank_Name { get; set; }

    }
}
