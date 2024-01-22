
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CONTRACT_SERVICE_DETAIL")]
    public class ContractServiceDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ServiceCode { get; set; }

        [StringLength(255)]
        public string ServiceName { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal Cost { get; set; }

        [StringLength(100)]
        public string ContractCode { get; set; }

        public int? ContractVersion { get; set; }

        [StringLength(500)]
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
        public double Tax { get; set; }
        public double Commission { get; set; }
        public double CustomFee { get; set; }
        public double Discount { get; set; }
        public string Currency { get; set; }
    }
}
