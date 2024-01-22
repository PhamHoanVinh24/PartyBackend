using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("FUND_CURRENCY")]
    public class FundCurrency
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string CurrencyCode { get; set; }
        
        public bool? DefaultPayment { get; set; }

        [StringLength(255)]
        public string Note { get; set; }
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

        public decimal ConversionRate { get; set; }
    }

    public class FundCurrencyModel
    {
        public int Id { get; set; }

        [StringLength(100)]
        public string CurrencyCode { get; set; }

        public bool? DefaultPayment { get; set; }

        [StringLength(255)]
        public string Note { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public string CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public string UpdatedTime { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }

        public string DeletedTime { get; set; }
    }


}
